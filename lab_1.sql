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
  check_out TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
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
