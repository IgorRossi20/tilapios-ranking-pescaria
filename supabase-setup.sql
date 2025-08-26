-- Script de configuração do banco de dados Supabase para a aplicação Tilapios

-- Tabela de capturas
CREATE TABLE captures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_name TEXT NOT NULL,
  fish_name TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  length NUMERIC NOT NULL,
  location TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  photo_url TEXT,
  notes TEXT
);

-- Configurar RLS (Row Level Security)
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todas as capturas
CREATE POLICY "Capturas são visíveis para todos os usuários autenticados"
  ON captures FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir que usuários insiram suas próprias capturas
CREATE POLICY "Usuários podem inserir suas próprias capturas"
  ON captures FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias capturas
CREATE POLICY "Usuários podem atualizar suas próprias capturas"
  ON captures FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam suas próprias capturas
CREATE POLICY "Usuários podem excluir suas próprias capturas"
  ON captures FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Função para calcular o ranking
CREATE OR REPLACE FUNCTION calculate_ranking()
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  total_captures INTEGER,
  total_weight NUMERIC,
  biggest_fish NUMERIC,
  score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.user_id,
    c.user_name,
    COUNT(*)::INTEGER AS total_captures,
    SUM(c.weight) AS total_weight,
    MAX(c.weight) AS biggest_fish,
    (SUM(c.weight) * 10 + MAX(c.weight) * 5 + COUNT(*) * 2) AS score
  FROM captures c
  GROUP BY c.user_id, c.user_name
  ORDER BY score DESC;
END;
$$ LANGUAGE plpgsql;

-- Criar view para o ranking
CREATE VIEW ranking AS
SELECT * FROM calculate_ranking();

-- Função para obter as estatísticas de um usuário
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_captures INTEGER,
  total_weight NUMERIC,
  biggest_fish NUMERIC,
  average_weight NUMERIC,
  score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_captures,
    SUM(c.weight) AS total_weight,
    MAX(c.weight) AS biggest_fish,
    CASE WHEN COUNT(*) > 0 THEN SUM(c.weight) / COUNT(*) ELSE 0 END AS average_weight,
    (SUM(c.weight) * 10 + MAX(c.weight) * 5 + COUNT(*) * 2) AS score
  FROM captures c
  WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o nome do usuário em todas as capturas quando ele mudar
CREATE OR REPLACE FUNCTION update_user_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE captures
  SET user_name = NEW.raw_user_meta_data->>'name'
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data->>'name' IS DISTINCT FROM NEW.raw_user_meta_data->>'name')
  EXECUTE FUNCTION update_user_name();