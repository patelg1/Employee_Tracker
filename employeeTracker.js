// Required dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');
require('console.table');
const figlet = require('figlet');
require('dotenv').config();

// Connection to mysql
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

// Main menu when application is run
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
                'Delete Employee',
                'Exit'                
            ],
            name: 'action'
        }
        // switch statement where based on choice from menu, function is run
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

            case 'Delete Employee':
                deleteEmployee();
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

// Displays all employees in company with name, title, department, salary and manager
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

// View all roles in company and which employees are in each role
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

// View all department in company and which employee is in each department
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

// Add a new role to comany, with salary and department it is part of
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

// Add new employee to company
const addEmployee = () => {
    const query = 'SELECT CONCAT (first_name," ", last_name) AS full_name, title FROM employee RIGHT OUTER JOIN role ON employee.role_id = role.id; '    
    //const role_id;

    connection.query(query, (err, results) => {
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
                        if (!roleArray.includes(results.title)) {                   
                        roleArray.push(results.title);
                        }
                    })
                    console.log(roleArray);
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
                        console.log('Employee full name: ' + results.full_name);
                        if (results.full_name != null){
                            managerArray.push(results.full_name);
                        }
                        
                    })
                    return managerArray;
                },
                name: 'addManager'
            }
        ]).then((answer) => {
            connection.query('SELECT id FROM employee WHERE CONCAT (first_name, " ", last_name) = ?', 
                [answer.addManager], (err, results) => {
                    if (err) {
                        throw err
                    };
                    console.log(results[0].id);
                    const query3 = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, (SELECT id FROM role WHERE title = ?), ?);'
                    connection.query(query3, [answer.firstName, answer.lastName, answer.addRole, results[0].id], (err, results) => {
                        if (err) {
                            throw err;
                        };
                        allEmployeeSearch();
                    })
                }
            )            
        })
    })
}

// Update role of employee
const updateRole = () => {    
    const query = 'SELECT CONCAT (first_name," ", last_name) AS full_name, role.id AS role_id, title FROM employee RIGHT OUTER JOIN role ON employee.role_id = role.id;'    

    connection.query(query, (err, results) => {
        if (err){
            throw err;
        }
        inquirer.prompt([
            {
                type: 'list',
                message: 'Which employee would you like to update role for?',
                choices: function () {
                    let employeeArray = [];
                    results.forEach(results => { 
                        if (results.full_name != null) {                   
                        employeeArray.push(results.full_name);
                        }
                    })                    
                    return employeeArray;

                },
                name: 'employeeUpdate'
            },
            {
                type: 'list',
                message: 'Select a new role',
                choices: function () {
                    let roleArray = [];
                    results.forEach(results => { 
                        if (!roleArray.includes(results.title)) {                   
                        roleArray.push(results.title);
                        }
                    })                    
                    return roleArray;

                },
                name: 'updatedRole'
            },
        ]).then((answer) => {
            connection.query('SELECT id FROM employee WHERE CONCAT (first_name, " ", last_name) = ?', 
                [answer.employeeUpdate], (err, results) => {
                    if (err) {
                        throw err
                    };
                    console.log(results[0].id);
                    console.log(answer.updatedRole);
                    const query3 = 'UPDATE employee SET role_id = (SELECT id FROM role WHERE title = ?) WHERE id = ?'
                    connection.query(query3, [answer.updatedRole, results[0].id], (err, results) => {
                        if (err) {
                            throw err;
                        };
                        mainMenu();
                    })
                }
            )
        })
    })
}

// Delete employee info from company
const deleteEmployee = () => {
    let query = "SELECT employeeManager.id, employeeManager.first_name, employeeManager.last_name, roleDept.title, roleDept.salary, roleDept.name AS department_name, employeeManager.manager_name ";
    query += "FROM (SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, employee.manager_id, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name ";
    query += "FROM employee LEFT JOIN employee AS manager ON manager.id = employee.manager_id) AS employeeManager LEFT JOIN (SELECT role.id, role.title, role.salary, department.name ";
    query += "FROM role LEFT JOIN department ON role.department_id = department.id) AS roleDept ON employeeManager.role_id = roleDept.id;"

    connection.query(query, (err, results) => {
        if(err) {
            throw err;
        }
        console.table(results);
        inquirer.prompt([
            {
                type: 'input',
                message: 'Enter the employee id you want to remove',
                name: 'removeID'
            }
        ]).then((answer) => {
            connection.query('DELETE FROM employee WHERE ?', {id: answer.removeID})
            mainMenu();
        }) 
    });
}

// View all departments
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

// View all roles
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
