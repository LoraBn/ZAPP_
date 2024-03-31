# Routes Docs:

### HELPER 
METHOD http://link-for-api-req {req parameters if any} => {response data} : {error_messages}

## Global routes:

- **Sign In** POST: /api/signin { userName, password } => { userId, userType, token } : {error_message}

## Owner routes:

- **Sign Up** POST: /api/owner/signup { name, lastName, userName, password} => {{ userId, token }} : {error_message}

- **Update owner profile** PUT: /api/owner/update {message} : {error_message}

### Customers:

- **Get customers list** GET: /api/owner/customers {customers} : {error_message}

- **Create customer account** POST: /api/owner/customers {name, lastName, username, password, address, planName, equipmentName} => { user_info: { userName, password } } : {error_message}

- **Update customer account** PUT: /api/owner/customers/:username { name, lastName, username, password, address, planName, equipementName,} => {message, user_info} : {error_message}

- **Delete customer account** DELETE: /api/owner/customers/:username => {message} : {error_message}

### Employees:

- **Get All Employees** GET: /api/owner/employees {} => {employees} : {error_message}

- **Create Emplpoyee** POST: /api/owner/employees {name, lastName, userName , password, salary} => {user_info: { userName, password}}: {error_message}

- **Update Employee Table** PUT: /api/owner/employees/:username { name, lastName, userName, password, salary} => {message, user_info} : {error_message}

- **Delete Employee Table** DELETE: /api/owner/employee/:username => {message} : {error_message}

### equpments:

- **Create equipment** POST: /api/owner/equipments {message} : {error_message}

- **Get all equipments** GET: /api/owner/equipments { equipments } : { error_message }

- **Update equipment** PUT: /api/owner/equipments/:username => { message } : { error_message }

- **Delete equipement** DELETE: /api/owner/equipments/:username =>{message} : {error_message}

### announcements;

- **get announcement** GET: /api/owner/announcements => {announcements} : {error_message}

- **Create announcement** POST: /api/owner/announcements {target_type, announcement_title, announcement_message } => {message, announcementTitle, } : {error_message}

- **Delete annoucement** DELETE: /api/owner/announcements/:id => {message} : {error_message}

### Subscription plans:

- **Get plan list** GET: /api/owner/plans => {plans} : {error_message}

- **Create plan** POST: /api/owner/plans { plan_name, plan_price } => {plan_id, message} : {error_message};

- **Update plan** PUT: /api/owner/plans/:id { plan_name, plan_price } => {plan_id, message} : {error_message}

- **Delete plan** DELETE: /api/owner/plans/:id => {message} : {error_message}

### Electric schedule:

- **Get eletric schedule** GET: /api/owner/electric-schedule => {schedule} : {error_message}

- **Create electric schedule** POST: /api/owner/electric-schedule {daily_schedule:[('04:00', '08:30'), ('09:00', '12:00'), ('05:00', '09:30')]} => {schedule_id, message} : {error_message}

- **Update electric schedule** PUT: /api/owner/electric-schedule/:id {daily_schedule} => {schedule_id, message}: {error_message}

- **Delete electric schedule** DELETE: /api/owner/electric-schedule/:id => {message} : {error_message}

### Kwh_price
- **Get kwh price** GET: /api/owner/price => {price} : {error_message}

- **Set kwh price** POST: /api/owner/price {kwh_price} => {price_id, message}: {error_message}  

- **update kwh price** POST: /api/owner/price/:id {kwh_price} => {message}: {error_message}  

- **Delete kw price** DELETE: /api/owner/price/:id => {message}: {error_message}

### Bills

- **Get all bills** GET: /api/owner/bills => {bills} : {error_message}

- **Get the Bill of a Customer** GET: /api/owner/bills/:username => {bill} : {error_message}

- **Create Bills** POST: /api/owner/bills { customerUsername, previous_meter, current_meter, total_kwh, total_amount, billing_status, remaining_amount} => {bill_id, message} : {error_message}

- **Update Bill** PUT: /api/owner/bills/:id {ustomerUsername, previous_meter, current_meter, total_kwh, total_amount, billing_status, remaining_amount} => {bill_id, message} : {error_message}

- **Delete Bill** DELETE: /api/owner/bills/:id => {message} : {error_message}

### Billing Cycle
= **Start Billing** POST: /api/owner//billing-cycle/start => {cycleId, message} : {error_message}
= **Stop Billing** POST: /api/owner//billing-cycle/stop => {cycleId, message} : {error_message}

### Expenses

- **Get Expenses** GET: /api/owner/expenses => {expenses} : {error_message}

- **Create expense** POST: /api/owner/expenses {username, description, amount} => {expenseId, message}: {error_message}

- **update Expense** PUT: /api/owner/expenses/:id { username, description, amount } => {expenseId, message}: {error_message}

-  **delete Expense** DELETE: /api/owner/expenses/:id => {message} : {error_message}

### Support Tickets between owner and customers

- **Create Support Ticket** POST: /api/owner/ticket
{ customer_username, ticket_title, ticket_message, is_urgent } => { ticketId, message } : { error_message }

- **Update Support Ticket** PUT: /api/owner/ticket/:id
{ customer_username, ticket_title, ticket_message, is_urgent, is_closed } => { ticket_id, message } : { error_message }

- **Delete Support Ticket** DELETE: /api/owner/ticket/:id => { message } : { error_message }

- **Get Support Ticket** GET: /api/owner/ticket/:id => { support_ticket } : { error_message }

- **Get All Support Tickets** GET: /api/owner/ticket => { support_ticket_list } : { error_message }

- **Get All Open Tickets** GET: /api/owner/ticket/open => { open_tickets_list } : { error_message }

- **Get All Closed Tickets** GET: /api/owner/ticket/close => { closed_tickets_list } : { error_message }

- **Close Support Ticket** PUT: /api/owner/ticket/:id/close => { ticket_id, message } : { error_message }

### Support Ticket Replies

- **Get Ticket Replies** GET: /api/owner/ticket/:id/reply => { replies_list } : { error_message }

- **Create Ticket Reply** POST: /api/owner/ticket/:id/reply { customerUsername, replyText, isSentByOwner } => { replyId, userType, createdAt, message } : { error_message }

### Issues Alert tickets between owner and Employees

- **Get all the tickets** GET:  /api/owner/issues => {alert_ticket_list} : {error_message}

- **Get ALert ticket** GET: /api/owner/issues/:id => {alert_ticket} : {error_message}

- **Get all open alerts** GET: /api/owner/issues/open => {open_alerts_list} : {error_message}

-  **Get all closed alerts** GET: /api/owner/issues/close => {closed_alerts_list} : {error_message}

- **Update alert issue ticket** PUT: /api/owner/issues/:id {alert_type, alert_message} => {alertId, message} : {error_message}

- **Close alert ticket** PUT: /api/owner/issues/:id/close =>{alert_id, message} : {error_message}

- **Create alert ticket** POST: /api/owner/issues {alert_type, alert_message} => {alertId, message} : {error_message}

- **Delete alert ticket** DELETE: /api/owner/issues/:id => { message } : { error_message }

### Alert Replies

- **Create a reply for an alert** POST: /api/owner/issues/:id/reply {replyText} => {replyId, userType, createdAt, message} : {error_message}

- **Get all the replies of an alert** GET: /api/owner/issues/:id/reply => {replies_list} : {error_message}

## Employee Routes:

- **Update Profile**  PUT: /api/employee/profile { name, lastName, userName, password} => {message, token}

### Customers interactions

- **Get customers list** GET: /api/employee/customers {customers} : {error_message}

- **Create customer account** POST: /api/employee/customers {name, lastName, userName, password, address, planName, equipementName, scheduleName} => { user_info: { userName, password } } : {error_message}

- **Update customer account** PUT: /api/employee/customers/:username { name, lastName, userName, password, address, planName, equipementName, scheduleName,} => {message, user_info} : {error_message}

- **Delete customer account** DELETE: /api/owner/customers/:username => {message} : {error_message}

### Bills

- **Get all bills** GET: /api/employee/bills => {bills} : {error_message}

- **Get the Bill of a Customer** GET: /api/employee/bills/:username => {bill} : {error_message}

- **Create Bills** POST: /api/employee/bills { customerUsername, previous_meter, current_meter, total_kwh, total_amount, billing_status, remaining_amount} => {bill_id, message} : {error_message}

- **Update Bill** PUT: /api/employee/bills/:id {ustomerUsername, previous_meter, current_meter, total_kwh, total_amount, billing_status, remaining_amount} => {bill_id, message} : {error_message}

- **Delete Bill** DELETE: /api/employee/bills/:id => {message} : {error_message}

### Kwh_price
- **Get kwh price** GET: /api/owner/price => {price} : {error_message}

### Alert Ticketing system:

- **Get ALert ticket** GET: /api/employee/issues/:id => {alert_ticket} : {error_message}

- **Get all open alerts** GET: /api/employee/issues/open => {open_alerts_list} : {error_message}

- **Create alert ticket** POST: /api/employee/issues {alert_type, alert_message} => {alertId, message} : {error_message}

### Alert Replies

- **Create a reply for an alert** POST: /api/employee/issues/:id/reply {replyText} => {replyId, userType, createdAt, message} : {error_message}

- **Get all the replies of an alert** GET: /api/employee/issues/:id/reply => {replies_list} : {error_message}

## Announcements

- **Get all announcements** GET: /api/employee/announcements => {announcements} : {error_message}