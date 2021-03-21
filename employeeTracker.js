const inquirer = require('inquirer');
const mysql = require('mysql');
require('console.table');
const figlet = require('figlet');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',    
    port: 3306,  
    user: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  connection.connect((err) => {
    if (err) throw err;
    console.log(figlet.textSync('Employee Tracker'));

    mainMenu();
  });

const mainMenu = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Employees by Department',
                'View All Employees by Role',
                'Add Departments',
                'Add Roles',
                'Add Employees',
                'Update Employee Role',
                'Exit'                
            ],
            name: 'action'
        }
    ]).then((answer) => {
        switch (answer.action){
            case 'View All Employees':
                allEmployeeSearch();
                break;
            
            case 'View All Employees by Department':
                departmentSearch();
                break;

            case 'View All Employees by Role':
                roleSearch();
                break;

            case 'Add Departments':
                addDepartment();
                break;

            case 'Add Roles':
                addRoles();
                break;

            case 'Add Employees':
                addEmployee();
                break;
            
            case 'Update Employee Role':
                updateRole();
                break;

            case 'Exit':
                connection.end();
                break;

            default:
                console.log('Please choose one of the options');
                break;
        }
    });
};

const allEmployeeSearch = () => {
    let query = "SELECT employeeManager.id, employeeManager.first_name, employeeManager.last_name, roleDept.title, roleDept.salary, roleDept.name AS department_name, employeeManager.manager_name ";
    query += "FROM (SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, employee.manager_id, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name ";
    query += "FROM employee LEFT JOIN employee AS manager ON manager.id = employee.manager_id) AS employeeManager LEFT JOIN (SELECT role.id, role.title, role.salary, department.name ";
    query += "FROM role LEFT JOIN department ON role.department_id = department.id) AS roleDept ON employeeManager.role_id = roleDept.id;"

    connection.query(query, (err, results) => {
        if(err) {
            throw err;
        }
        console.table(results);
        mainMenu();

    });

};

const departmentSearch = () => {
    const query = "SELECT employee.first_name, employee.last_name, department.name AS department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department on role.department_id = department.id ORDER BY department.name;"

    connection.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        console.table(results);
        mainMenu();
    })

};

const roleSearch = () => {
    const query = "SELECT employee.first_name, employee.last_name, role.title AS role FROM employee INNER JOIN role ON employee.role_id = role.id ORDER BY role.title;"

    connection.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        console.table(results);
        mainMenu();
    })
};

const addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new department?',
            name: 'newDept'
        }
    ]).then((answer) => {
        query = 'INSERT INTO department (name) VALUES (?);'
        
        connection.query(query, answer.newDept, (err, results) => {
            if (err) {
                throw err;
            }
            viewDept();
        })
    })

}

const addRoles = () => {
    connection.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'input',
                message: 'What is the name of the new role?',
                name: 'newRole'
            },
            {
                type: 'input',
                message: 'What is the salary of the new role?',
                name: 'newSalary'
            },
            {
                type: 'list',
                message: 'Which Department is the new role in?',
                choices: function(){
                    let deptArray = [];
                    results.forEach(results => {
                        deptArray.push(results.name);                        
                    });
                    return deptArray;
                },
                name: 'dept'
            }
        ]).then((answer) => {
            let department_id;
            results.forEach(results => {
                if (results.name == answer.dept){
                    department_id = results.id
                }
            })
            connection.query('INSERT INTO role SET ?', 
            {
                title: answer.newRole,
                salary: answer.newSalary,
                department_id: department_id
            }, (err, res) => {
                if (err){
                    throw err;
                }
                viewRole();
            })
        })
    })
    
}

const addEmployee = () => {
    const query = 'SELECT title FROM role;'
    const query2 = 'SELECT CONCAT (first_name," ", last_name) AS full_name FROM employee;'

    connection.query(query, query2, (err, results) => {
        if (err) {
            throw err;
        };
        inquirer.prompt([
            {
                type: 'input',
                message: 'What is the first name?',
                name: 'firstName'
            },
            {
                type: 'input',
                message: 'What is the last name?',
                name: 'lastName'
            },
            {
                type: 'list',
                message: 'What is the role?',
                choices: function () {
                    let roleArray = [];
                    results.forEach(results => {
                        roleArray.push(results.title);
                    })
                    return roleArray;
                },
                name: 'addRole'
            },
            {
                type: 'list',
                message: 'Who is the manager?',
                choices: function () {
                    let managerArray = [];
                    results.forEach(results => {
                        managerArray.push(results.full_name);
                    })
                    return managerArray;
                },
                name: 'addManager'
            }
        ]).then((answer) => {
            const query3 = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) ';
            query3 += 'VALUES (?, ?, (SELECT id FROM role WHERE title = ?), ';
            query3 += '(SELECT id FROM (SELECT id FROM employee WHERE CONCAT (first_name, " ", last_name) = ?) AS temp));'
            connection.query(query3, [answer.firstName, answer.lastName, answer.addRole, answer.addManager], (err, results) => {
                if (err) {
                    throw err;
                };
                allEmployeeSearch();
            })
        })
    })
}

const updateRole = () => {    
    const query = 'SELECT CONCAT (first_name," ", last_name) AS full_name FROM employee;'
    const query2 = 'SELECT title FROM role;'

    connection.query(query, query2, (err, results) => {
        if (err){
            throw err;
        }
        inquirer.prompt([
            {
                type: 'list',
                message: 'Which employee would you like to update role for?',
                choices: function() {
                    let employeeArray = results.map(choice => choice.full_name);
                    return employeeArray;
                },
                name: 'employeeUpdate'
            },
            {
                type: 'list',
                message: 'Select a new role',
                choices: function () {
                    let choiceArray = results.map(choice => choice.title);
                    return choiceArray;
                },
                name: 'updatedRole'
            },
        ]).then((answer) => {
            connection.query('UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE id = (SELECT id FROM employee WHERE CONCAT(first_name," ", last_name) = ?) AS temp', [answer.updateRole, answer.employeeUpdate], (err, results) => {
                if (err) {
                    throw err;
                };
                mainMenu();
            })
        })
    })
}

const viewDept = () => {
    const query = 'SELECT department.name FROM department;'

    connection.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        console.table(results);
        mainMenu();
    })
}

const viewRole = () => {
    const query = 'SELECT role.title, role.salary, role.department_id FROM role;'

    connection.query(query, (err, results) => {
        if (err) {
            throw err;
        }
        console.table(results);
        mainMenu();
    })
}
