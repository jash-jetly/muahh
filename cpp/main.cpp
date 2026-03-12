#include <iostream>
#include <string>
#include <fstream>
using namespace std;

struct Product {
    int    i;
    string n;
    string t;
    float  r;
    int    s;
};

struct User {
    int    i;
    string n;
    string e;
    string p;
};

struct Order {
    int    i;
    int    u;
    int    d;
    string n;
    int    q;
    float  a;
    string s;
    int    c;
};

const int M = 100;

Product P[M];
int p = 0;

User U[M];
int u = 0;

Order O[M];
int o = 0;

int x = 1001;

void saveProducts() {
    ofstream f;
    f.open("products.txt");

    if (!f) {
        cout << "  ERROR: Could not open products.txt to save!\n";
        return;
    }

    for (int i = 0; i < p; i++) {
        f << P[i].i << "|"
          << P[i].n << "|"
          << P[i].t << "|"
          << P[i].r << "|"
          << P[i].s << "\n";
    }

    f.close();
}

void loadProducts() {
    ifstream f;
    f.open("products.txt");

    if (!f) {
        cout << "  products.txt not found. Starting fresh.\n";
        return;
    }

    p = 0;
    string l;

    while (getline(f, l)) {
        if (l.empty()) continue;

        string a[5];
        int x = 0;
        string c = "";

        for (int i = 0; i < l.length(); i++) {
            if (l[i] == '|') {
                a[x++] = c;
                c = "";
            } else {
                c += l[i];
            }
        }
        a[x] = c;

        P[p].i = stoi(a[0]);
        P[p].n = a[1];
        P[p].t = a[2];
        P[p].r = stof(a[3]);
        P[p].s = stoi(a[4]);
        p++;
    }

    f.close();
}

void saveUsers() {
    ofstream f;
    f.open("users.txt");

    if (!f) {
        cout << "  ERROR: Could not open users.txt to save!\n";
        return;
    }

    for (int i = 0; i < u; i++) {
        f << U[i].i << "|"
          << U[i].n << "|"
          << U[i].e << "|"
          << U[i].p << "\n";
    }

    f.close();
    cout << "  Users saved to users.txt\n";
}

void loadUsers() {
    ifstream f;
    f.open("users.txt");

    if (!f) {
        cout << "  users.txt not found. Starting fresh.\n";
        return;
    }

    u = 0;
    string l;

    while (getline(f, l)) {
        if (l.empty()) continue;

        string a[4];
        int x = 0;
        string c = "";

        for (int i = 0; i < l.length(); i++) {
            if (l[i] == '|') {
                a[x++] = c;
                c = "";
            } else {
                c += l[i];
            }
        }
        a[x] = c;

        U[u].i = stoi(a[0]);
        U[u].n = a[1];
        U[u].e = a[2];
        U[u].p = a[3];
        u++;
    }

    f.close();
}

void saveOrders() {
    ofstream f;
    f.open("orders.txt");

    if (!f) {
        cout << "  ERROR: Could not open orders.txt to save!\n";
        return;
    }

    f << x << "\n";

    for (int i = 0; i < o; i++) {
        f << O[i].i << "|"
          << O[i].u << "|"
          << O[i].d << "|"
          << O[i].n << "|"
          << O[i].q << "|"
          << O[i].a << "|"
          << O[i].s << "|"
          << O[i].c << "\n";
    }

    f.close();
    cout << "  Orders saved to orders.txt\n";
}

void loadOrders() {
    ifstream f;
    f.open("orders.txt");

    if (!f) {
        cout << "  orders.txt not found. Starting fresh.\n";
        return;
    }

    o = 0;
    string l;

    if (getline(f, l)) {
        x = stoi(l);
    }

    while (getline(f, l)) {
        if (l.empty()) continue;

        string a[8];
        int x = 0;
        string c = "";

        for (int i = 0; i < l.length(); i++) {
            if (l[i] == '|') {
                a[x++] = c;
                c = "";
            } else {
                c += l[i];
            }
        }
        a[x] = c;

        O[o].i = stoi(a[0]);
        O[o].u = stoi(a[1]);
        O[o].d = stoi(a[2]);
        O[o].n = a[3];
        O[o].q = stoi(a[4]);
        O[o].a = stof(a[5]);
        O[o].s = a[6];
        O[o].c = stoi(a[7]);
        o++;
    }

    f.close();
}

void saveAll() {
    saveProducts();
    saveUsers();
    saveOrders();
    cout << "  All data saved!\n";
}

void loadAll() {
    loadProducts();
    loadUsers();
    loadOrders();
}

void exportOrderReport() {
    ofstream f;
    f.open("order_report.txt");

    if (!f) {
        cout << "  ERROR: Could not create order_report.txt!\n";
        return;
    }

    f << "        ORDER REPORT\n";
    if (o == 0) {
        f << "No orders found.\n";
    } else {
        float r = 0;
        for (int i = 0; i < o; i++) {
            f << "Order ID    : " << O[i].i      << "\n";
            f << "User ID     : " << O[i].u       << "\n";
            f << "Product     : " << O[i].n  << "\n";
            f << "Quantity    : " << O[i].q      << "\n";
            f << "Total       : Rs." << O[i].a << "\n";
            f << "Payment     : " << O[i].s << "\n";
            f << "Status      : " << (O[i].c ? "CANCELLED" : "ACTIVE") << "\n";

            if (O[i].s == "PAID")
                r += O[i].a;
        }
        f << "\nTotal Revenue (PAID orders): Rs." << r << "\n";
    }

    f.close();
    cout << "  Report exported to order_report.txt\n";
}

void addProduct(string n, string t, float r, int s) {
    P[p].i = p + 1;
    P[p].n = n;
    P[p].t = t;
    P[p].r = r;
    P[p].s = s;
    p++;
    cout << "  Product added! ID = " << p << "\n";
}

void listProducts() {
    if (p == 0) { cout << "  No products available.\n"; return; }
    cout << "\n  ID | Name              | Category     | Price    | Stock\n";
    cout << "    ---|-------------------|--------------|----------|------\n";
    for (int i = 0; i < p; i++) {
        cout << "  " << P[i].i
             << "  | " << P[i].n
             << "  | " << P[i].t
             << "  | Rs." << P[i].r
             << "  | " << P[i].s << "\n";
    }
}

void searchProduct(string n) {
    bool f = false;
    for (int i = 0; i < p; i++) {
        if (P[i].n == n) {
            cout << "  Found: " << P[i].n
                 << " | Price: Rs." << P[i].r
                 << " | Stock: " << P[i].s << "\n";
            f = true;
        }
    }
    if (!f) cout << "  Product not found.\n";
}

void removeProduct(int d) {
    for (int i = 0; i < p; i++) {
        if (P[i].i == d) {
            for (int j = i; j < p - 1; j++)
                P[j] = P[j + 1];
            p--;
            cout << "  Product removed.\n";
            return;
        }
    }
    cout << "  Product not found.\n";
}

void registerUser(string n, string e, string s) {
    for (int i = 0; i < u; i++) {
        if (U[i].e == e) { cout << "  Email already registered!\n"; return; }
    }
    U[u].i = u + 1;
    U[u].n = n;
    U[u].e = e;
    U[u].p = s;
    u++;
    cout << "  User registered! ID = " << u << "\n";
}

void loginUser(string e, string s) {
    for (int i = 0; i < u; i++) {
        if (U[i].e == e && U[i].p == s) {
            cout << "  Login successful! Welcome, " << U[i].n << "\n";
            return;
        }
    }
    cout << "  Wrong email or password.\n";
}

void listUsers() {
    if (u == 0) { cout << "  No users registered.\n"; return; }
    cout << "\n  ID | Name           | Email\n";
    cout << "    ---|----------------|----------------------\n";
    for (int i = 0; i < u; i++)
        cout << "  " << U[i].i << "  | " << U[i].n
             << "  | " << U[i].e << "\n";
}

void placeOrder(int d, int j, int q) {
    bool k = false;
    for (int i = 0; i < u; i++)
        if (U[i].i == d) { k = true; break; }
    if (!k) { cout << "  User not found.\n"; return; }

    int l = -1;
    for (int i = 0; i < p; i++)
        if (P[i].i == j) { l = i; break; }
    if (l == -1) { cout << "  Product not found.\n"; return; }
    if (P[l].s < q) {
        cout << "  Not enough stock! Available: " << P[l].s << "\n";
        return;
    }

    P[l].s -= q;

    O[o].i = x++;
    O[o].u = d;
    O[o].d = j;
    O[o].n = P[l].n;
    O[o].q = q;
    O[o].a = P[l].r * q;
    O[o].s = "PENDING";
    O[o].c = 0;
    o++;

    cout << "  Order placed! Order ID = " << x - 1
         << " | Total = Rs." << O[o-1].a << "\n";
}

void cancelOrder(int d) {
    for (int i = 0; i < o; i++) {
        if (O[i].i == d) {
            if (O[i].c) { cout << "  Already cancelled.\n"; return; }
            O[i].c = 1;
            O[i].s = "REFUNDED";
            for (int j = 0; j < p; j++) {
                if (P[j].i == O[i].d) {
                    P[j].s += O[i].q;
                    break;
                }
            }
            cout << "  Order cancelled. Stock restored.\n";
            return;
        }
    }
    cout << "  Order not found.\n";
}

void listOrders() {
    if (o == 0) { cout << "  No orders yet.\n"; return; }
    cout << "\n  OrderID | User | Product        | Qty | Total     | Payment  | Status\n";
    cout << "    --------|------|----------------|-----|-----------|----------|--------\n";
    for (int i = 0; i < o; i++) {
        cout << "  " << O[i].i
             << "      | " << O[i].u
             << "    | " << O[i].n
             << "  | " << O[i].q
             << "   | Rs." << O[i].a
             << " | " << O[i].s
             << " | " << (O[i].c ? "CANCELLED" : "ACTIVE") << "\n";
    }
}

void listOrdersByUser(int d) {
    bool f = false;
    for (int i = 0; i < o; i++) {
        if (O[i].u == d) {
            cout << "  #" << O[i].i
                 << " | " << O[i].n
                 << " x" << O[i].q
                 << " | Rs." << O[i].a
                 << " | " << O[i].s << "\n";
            f = true;
        }
    }
    if (!f) cout << "  No orders for this user.\n";
}

void updatePayment(int d, string s) {
    for (int i = 0; i < o; i++) {
        if (O[i].i == d) {
            if (O[i].c) { cout << "  Order is cancelled.\n"; return; }
            O[i].s = s;
            cout << "  Payment updated to " << s << "\n";
            return;
        }
    }
    cout << "  Order not found.\n";
}

void paymentSummary() {
    int d = 0, e = 0, f = 0, r = 0;
    float v = 0;
    for (int i = 0; i < o; i++) {
        if      (O[i].s == "PAID")     { d++;     v += O[i].a; }
        else if (O[i].s == "PENDING")  { e++;  }
        else if (O[i].s == "FAILED")   { f++;   }
        else if (O[i].s == "REFUNDED") { r++; }
    }
    cout << "\nPAYMENT SUMMARY\n"
         << "  Paid    : " << d     << "  | Revenue: Rs." << v << "\n"
         << "  Pending : " << e  << "\n"
         << "  Failed  : " << f   << "\n"
         << "  Refunded: " << r << "\n";
}

void loadSampleData() {
    if (p == 0) {
        cout << "  No products found in file. Loading sample products...\n";
        addProduct("Laptop",         "Electronics", 45000, 10);
        addProduct("Wireless Mouse", "Accessories",   500, 50);
        addProduct("USB-C Hub",      "Accessories",  1200, 30);
        addProduct("Keyboard",       "Accessories",  2000, 20);
        addProduct("Monitor 24inch", "Electronics", 12000,  8);
    }
    if (u == 0) {
        cout << "  No users found. Please register a new user from the menu.\n";
    }
}

void pause() {
    cout << "\n  Press Enter to continue...";
    cin.ignore();
    cin.get();
}

int main() {
    loadAll();

    loadSampleData();

    int c;

    while (true) {
        cout << "     E-COMMERCE BACKEND MANAGEMENT SYSTEM  \n";
        cout << "  1. Product Management\n";
        cout << "  2. User Management\n";
        cout << "  3. Order Management\n";
        cout << "  4. Payment Tracking\n";
        cout << "  5. File Options\n";
        cout << "  0. Save & Exit\n";
        cout << "  Enter choice: ";
        cin >> c;

        if (c == 0) {
            saveAll();
            cout << "\n  Goodbye!\n";
            break;
        }

        else if (c == 1) {
            int x;
            cout << "\n PRODUCT MENU\n"
                 << "  1. List all products\n"
                 << "  2. Search product\n"
                 << "  3. Add product\n"
                 << "  4. Remove product\n"
                 << "  Enter choice: ";
            cin >> x;
            if (x == 1) { listProducts(); pause(); }
            else if (x == 2) {
                string n; cout << "  Name: "; cin >> n;
                searchProduct(n); pause();
            } else if (x == 3) {
                string n, t; float r; int s;
                cout << "  Name: ";     cin >> n;
                cout << "  Category: "; cin >> t;
                cout << "  Price: ";    cin >> r;
                cout << "  Stock: ";    cin >> s;
                addProduct(n, t, r, s); pause();
            } else if (x == 4) {
                int i; cout << "  Product ID: "; cin >> i;
                removeProduct(i); pause();
            }
        }

        else if (c == 2) {
            int x;
            cout << "\n USER MENU\n"
                 << "  1. Register\n"
                 << "  2. Login\n"
                 << "  3. List users\n"
                 << "  Enter choice: ";
            cin >> x;
            if (x == 1) {
                string n, e, s;
                cout << "  Name: ";     cin >> n;
                cout << "  Email: ";    cin >> e;
                cout << "  Password: "; cin >> s;
                registerUser(n, e, s); pause();
            } else if (x == 2) {
                string e, s;
                cout << "  Email: ";    cin >> e;
                cout << "  Password: "; cin >> s;
                loginUser(e, s); pause();
            } else if (x == 3) { listUsers(); pause(); }
        }

        else if (c == 3) {
            int x;
            cout << "\n ORDER MENU \n"
                 << "  1. Place order\n"
                 << "  2. Cancel order\n"
                 << "  3. List all orders\n"
                 << "  4. My orders (by user ID)\n"
                 << "  Enter choice: ";
            cin >> x;
            if (x == 1) {
                int u, d, q;
                cout << "  User ID: ";   cin >> u;
                cout << "  Product ID: "; cin >> d;
                cout << "  Quantity: ";  cin >> q;
                placeOrder(u, d, q); pause();
            } else if (x == 2) {
                int i; cout << "  Order ID: "; cin >> i;
                cancelOrder(i); pause();
            } else if (x == 3) { listOrders(); pause(); }
            else if (x == 4) {
                int u; cout << "  User ID: "; cin >> u;
                listOrdersByUser(u); pause();
            }
        }

        else if (c == 4) {
            int x;
            cout << "\n PAYMENT MENU\n"
                 << "  1. Update status\n"
                 << "  2. Summary\n"
                 << "  Enter choice: ";
            cin >> x;
            if (x == 1) {
                int i; string s;
                cout << "  Order ID: "; cin >> i;
                cout << "  Status (PAID/FAILED/PENDING): "; cin >> s;
                updatePayment(i, s); pause();
            } else if (x == 2) { paymentSummary(); pause(); }
        }

        else if (c == 5) {
            int x;
            cout << "\n FILE OPTIONS \n"
                 << "  1. Save all data to files\n"
                 << "  2. Reload data from files\n"
                 << "  3. Export order report (order_report.txt)\n"
                 << "  Enter choice: ";
            cin >> x;
            if (x == 1) { saveAll(); pause(); }
            else if (x == 2) {
                p = 0; u = 0; o = 0;
                loadAll(); pause();
            }
            else if (x == 3) { exportOrderReport(); pause(); }
        }

        else {
            cout << "  Invalid choice!\n";
        }
    }

    return 0;
}

