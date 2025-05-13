-- Создание таблицы сотрудников и ее индексов
CREATE TABLE employees(
  employee_id SERIAL PRIMARY KEY,
  employee_name VARCHAR(45) NOT NULL,
  employee_surname VARCHAR(45) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  CONSTRAINT valid_email
  CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  hire_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  position VARCHAR(45) NOT NULL
);

CREATE INDEX idx_full_name ON employees(employee_name, employee_surname);
CREATE INDEX idx_email ON employees(email);

-- Создание таблицы посещаемости и ее индексов
CREATE TABLE attendances(
  attendance_id SERIAL PRIMARY KEY,
  check_in TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  check_out TIMESTAMP(0) WITHOUT TIME ZONE,
  employee_id INTEGER REFERENCES employees(employee_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE
);

CREATE INDEX idx_employee_attendance ON attendances(employee_id);

-- Создание таблицы проектов и ее индексов
CREATE TABLE projects(
  project_id SERIAL PRIMARY KEY,
  project_name VARCHAR(45) UNIQUE NOT NULL,
  client VARCHAR(45),
  start_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  end_date TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  employee_id INTEGER REFERENCES employees(employee_id);
  description TEXT
);

CREATE INDEX idx_project_name ON projects(project_name);
CREATE INDEX idx_deadline ON projects(start_date, end_date);

-- Создание таблицы задач и ее индексов
CREATE TYPE PRIORITY AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE tasks(
  task_id SERIAL PRIMARY KEY,
  task_name VARCHAR(100) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT FALSE,
  priority PRIORITY,
  description TEXT,
  deadline TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  project_id INTEGER REFERENCES projects(project_id)
  ON UPDATE CASCADE 
  ON DELETE CASCADE
);

CREATE INDEX idx_task_name ON tasks(task_name);
CREATE INDEX idx_project_id ON tasks(project_id);

-- Вставка данных в таблицу employees (сотрудники)
INSERT INTO employees (employee_name, employee_surname, email, hire_date, position)
VALUES
    ('Иван', 'Иванов', 'ivan.ivanov@example.com', '2020-05-15 09:00:00', 'Разработчик'),
    ('Петр', 'Петров', 'petr.petrov@example.com', '2019-03-10 09:00:00', 'Менеджер проектов'),
    ('Анна', 'Сидорова', 'anna.sidorova@example.com', '2021-07-22 09:00:00', 'Дизайнер'),
    ('Мария', 'Кузнецова', 'maria.kuznetsova@example.com', '2022-01-30 09:00:00', 'Тестировщик'),
    ('Алексей', 'Смирнов', 'alexey.smirnov@example.com', '2020-11-05 09:00:00', 'Аналитик');

-- Вставка данных в таблицу projects (проекты)
INSERT INTO projects (project_name, client, start_date, end_date, description)
VALUES
    ('Система учета', 'ООО Ромашка', '2023-01-10 00:00:00', '2023-06-30 00:00:00', 'Разработка CRM-системы'),
    ('Мобильное приложение', 'ИП Сергеев', '2023-02-15 00:00:00', '2023-08-20 00:00:00', 'Приложение для доставки еды'),
    ('Веб-портал', 'ЗАО Технологии', '2023-03-01 00:00:00', '2023-09-15 00:00:00', 'Корпоративный портал'),
    ('Автоматизация склада', 'ООО Логистик', '2023-04-05 00:00:00', '2023-10-10 00:00:00', 'Внедрение WMS-системы');

-- Вставка данных в таблицу tasks (задачи)
INSERT INTO tasks (task_name, status, priority, description, deadline, project_id)
VALUES
    ('Разработать API', FALSE, 'high', 'REST API для интеграции', '2023-05-20 18:00:00', 1),
    ('Создать дизайн макета', FALSE, 'medium', 'UI/UX для главной страницы', '2023-03-25 18:00:00', 2),
    ('Написать тесты', TRUE, 'low', 'Юнит-тесты для модуля оплаты', '2023-04-10 18:00:00', 1),
    ('Оптимизировать БД', FALSE, 'critical', 'Индексы и запросы', '2023-06-15 18:00:00', 3),
    ('Документирование', FALSE, 'low', 'Техническая документация', '2023-07-01 18:00:00', 4);

-- Вставка данных в таблицу attendances (посещаемость)
INSERT INTO attendances (check_in, check_out, employee_id)
VALUES
    ('2023-05-01 09:00:00', '2023-05-01 18:00:00', 1),
    ('2023-05-01 09:05:00', '2023-05-01 17:50:00', 2),
    ('2023-05-01 09:10:00', '2023-05-01 18:30:00', 3),
    ('2023-05-02 08:55:00', '2023-05-02 17:45:00', 1),
    ('2023-05-02 09:00:00', '2023-05-02 18:00:00', 4);


-- Выполнение заданий со второй лабы
-- 1) многотабличный запрос выборки с сортировкой и отбором данных (INNER JOIN, WHERE, ORDER BY),
SELECT 
    t.task_name,
    t.deadline,
    p.project_name,
    e.employee_name,
    e.employee_surname
FROM tasks t
INNER JOIN projects p ON t.project_id = p.project_id
INNER JOIN employees e ON e.employee_id = 1 -- например, сотрудник с ID 1
WHERE t.status = FALSE
ORDER BY t.deadline;

-- 2)запрос с применением вычисляемых полей (примечание: не применять агрегатные функции), например, вычислить возраст, полную цену, и типа подобное
SELECT 
    employee_name,
    employee_surname,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) AS years_of_service
FROM employees;

-- 3) запрос выборки с внешним объединением двух отношений (LEFT|RIGHT JOIN)
SELECT 
    e.employee_name,
    e.employee_surname,
    t.task_name
FROM employees e
LEFT JOIN attendances a ON e.employee_id = a.employee_id
LEFT JOIN tasks t ON t.project_id IN (
    SELECT project_id FROM projects
);

-- 4) запрос группировкой, вычислением итогов и отбором данных (GROUP BY, HAVING),
SELECT 
    p.project_name,
    COUNT(t.task_id) AS task_count
FROM projects p
JOIN tasks t ON p.project_id = t.project_id
GROUP BY p.project_name
HAVING COUNT(t.task_id) > 1;

-- 5) запрос на добавление (INSERT INTO),
INSERT INTO employees (employee_name, employee_surname, email, hire_date, position)
VALUES ('Денис', 'Орлов', 'denis.orlov@example.com', '2023-02-15 09:00:00', 'DevOps');

-- 6) запрос на обновление,
UPDATE employees
SET position = 'Старший DevOps'
WHERE email = 'denis.orlov@example.com';

-- 7) запрос на удаление,
DELETE FROM tasks
WHERE priority = 'critical';

-- 8) запрос на создание новой таблицы на основе существующей
CREATE TABLE overdue_tasks AS
SELECT *
FROM tasks
WHERE deadline < NOW(); -- задачи, дедлайн которых уже прошел

-- 9) запрос на объединение (UNION), где применимо (только в SQL)
SELECT employee_name AS name FROM employees
UNION
SELECT project_name FROM projects;

-- 10) вложенный запрос на SQL (вложение во фразе WHERE),
SELECT *
FROM tasks
WHERE project_id IN (
    SELECT project_id FROM projects
    WHERE start_date > '2023-03-01'
);

-- 11) запрос на создание новой таблицы,
CREATE TABLE archived_tasks (
    task_id SERIAL PRIMARY KEY,
    original_task_id INTEGER,
    archived_at TIMESTAMP DEFAULT NOW()
);

-- 12) запрос на создание индекса,
CREATE INDEX idx_hire_date ON employees(hire_date);

-- 13) запрос на создание представления, объединяющего данные двух таблиц.
CREATE VIEW view_task_project AS
SELECT 
    t.task_name,
    t.status,
    t.priority,
    p.project_name,
    p.client
FROM tasks t
JOIN projects p ON t.project_id = p.project_id;
