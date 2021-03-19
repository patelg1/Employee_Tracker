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
    let query = "SELECT employeeManager.id, employeeManager.first_name, employeeManager.last_name, roleDept.title, roleDept.salary, roleDept.name AS department_name, employeeManager.manager_name FROM (SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, employee.manager_id, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name FROM employee LEFT JOIN employee AS manager ON manager.id = employee.manager_id) AS employeeManager LEFT JOIN (SELECT role.id, role.title, role.salary, department.name FROM role LEFT JOIN department ON role.department_id = department.id) AS roleDept ON employeeManager.role_id = roleDept.id;"

    connection.query(query, (err, results) => {
        if(err) {
            throw err;
        }
        console.table(results);
        mainMenu();

    });

};

const departmentSearch = () => {

};

const roleSearch = () => {

};

const addDepartment = () => {

}

const addRoles = () => {

}

const updateRole = () => {

}
