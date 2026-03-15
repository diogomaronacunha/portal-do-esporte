-- ============================================================
-- Portal do Esporte — Seed: Esportes
-- Modalidades mais praticadas no Rio Grande do Sul
-- ============================================================

INSERT INTO esportes (nome, slug, ativo) VALUES
  ('Futebol',          'futebol',          true),
  ('Futsal',           'futsal',           true),
  ('Vôlei',            'volei',            true),
  ('Beach Vôlei',      'beach-volei',      true),
  ('Basquete',         'basquete',         true),
  ('Handebol',         'handebol',         true),
  ('Atletismo',        'atletismo',        true),
  ('Corrida de Rua',   'corrida-de-rua',   true),
  ('Natação',          'natacao',          true),
  ('Ciclismo',         'ciclismo',         true),
  ('Triathlon',        'triathlon',        true),
  ('Tênis',            'tenis',            true),
  ('Tênis de Mesa',    'tenis-de-mesa',    true),
  ('Judô',             'judo',             true),
  ('Karatê',           'karate',           true),
  ('Boxe',             'boxe',             true),
  ('Jiu-Jitsu',        'jiu-jitsu',        true),
  ('Rugby',            'rugby',            true),
  ('Futebol Americano','futebol-americano', true),
  ('Padel',            'padel',            true),
  ('Squash',           'squash',           true),
  ('Ginástica',        'ginastica',        true),
  ('Xadrez',           'xadrez',           true),
  ('E-Sports',         'e-sports',         true),
  ('Outros',           'outros',           true)
ON CONFLICT (slug) DO NOTHING;
