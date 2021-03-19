use employee_trackerDB;

INSERT INTO department (name)
VALUES ('Sales'), ('Engineering'), ('Finance'), ('Legal'), ('Management');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 100000, 1),
       ('Salesperson', 80000, 1),
       ('Lead Engineer', 150000, 2),
       ('Software Engineer', 120000, 2),
       ('Accountant', 125000, 3),
       ('Legal Team Lead', 250000, 4),
       ('Lawyer', 190000, 4),       
       ('General Manager', 250000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Christian', 'Eckenrode', 8, NULL),
       ('John', 'Doe', 1, 1),
       ('Mike', 'Chan', 2, 2),
       ('Ashley', 'Rodriguez', 3, 1),
       ('Kevin', 'Tupik', 4, 4),
       ('Malia', 'Brown', 5, 1),
       ('Sarah', 'Lourd', 6, 1),
       ('Tom', 'Allen', 7, 7);
              