# E-Commerce Backend Management System

A robust, console-based C++ application designed to manage the core operations of an e-commerce platform. This system provides a comprehensive suite of tools for handling products, users, orders, and payments with persistent file storage.

## 🚀 Features

### 📦 Product Management
- **List Products**: View all available items with details like category, price, and stock levels.
- **Search**: Quickly find products by name.
- **Inventory Control**: Add new products or remove existing ones from the catalog.

### 👤 User Management
- **Registration**: Register new users with unique email addresses.
- **Authentication**: Secure login system for registered users.
- **User Records**: Maintain a list of all registered customers.

### 🛒 Order Processing
- **Place Orders**: Users can order products with specific quantities.
- **Validation**: Automatically checks stock availability and user existence before placing orders.
- **Order Tracking**: List all orders or filter them specifically for a single user.
- **Cancellations**: Full support for cancelling orders with automatic stock restoration.

### 💳 Payment Tracking
- **Status Updates**: Track payment statuses (PAID, PENDING, FAILED, REFUNDED).
- **Financial Summary**: View total revenue generated from successful transactions.
- **Reporting**: Export detailed order reports to `order_report.txt`.

## 🛠️ Technology Stack

- **Lanuage**: C++
- **Persistence**: Flat-file database (`products.txt`, `users.txt`, `orders.txt`)
- **Reporting**: Text-based report generation.

## 🏁 Getting Started

### Prerequisites
- A C++ compiler (GCC, Clang, or MSVC)

### Compilation
Compile the project using your preferred compiler. For example, using `g++`:

```bash
g++ main.cpp -o ecommerce_system
```

### Execution
Run the compiled executable:

```bash
./ecommerce_system
```

## 📂 File Structure

- `main.cpp`: The core application logic.
- `products.txt`: Stores product information (ID|Name|Category|Price|Stock).
- `users.txt`: Stores user credentials and details (ID|Name|Email|Password).
- `orders.txt`: Tracks all purchase transactions.
- `order_report.txt`: Generated report containing order history and revenue analysis.

## 📝 Usage Notes
- The system loads sample product data if no previous records are found.
- Always use **Save & Exit (Option 0)** in the main menu to ensure all changes are committed to the text files.
