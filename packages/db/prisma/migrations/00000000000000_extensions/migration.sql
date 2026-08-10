-- Bootstrap-миграция: расширения Postgres, необходимые остальным миграциям.
-- Должна оставаться первой в каталоге migrations (самое раннее имя папки),
-- чтобы citext-колонки (User.email) и последующие GIN/GiST-индексы работали.
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;
