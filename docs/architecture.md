# Punaflow Architecture

## Overview

Punaflow is designed using a layered architecture to separate concerns, improve maintainability, and support scalability. Each layer has a clear responsibility and communicates with other layers in a controlled way.

---

## Architecture Layers

### 1. UI Layer (User Interface)

**Responsibility:**
- Handles user interaction
- Displays menus and outputs
- Receives input from users

**Implementation:**
- `Menu.cs`

**Description:**
This layer is responsible for interacting with the user through a console-based interface. It does not contain business logic.

---

### 2. Services Layer (Business Logic)

**Responsibility:**
- Contains application logic
- Processes data from UI
- Calls repository methods

**Implementation:**
- `UserService.cs`

**Description:**
This layer acts as a bridge between the UI and the data layer. It ensures that business rules are applied before data is stored or retrieved.

---

### 3. Data Layer (Data Access)

**Responsibility:**
- Handles data storage and retrieval
- Implements repository pattern

**Implementation:**
- `IRepository.cs`
- `FileRepository.cs`

**Description:**
This layer abstracts data access using a generic repository interface. Data is stored and retrieved from CSV files.

---

### 4. Models Layer (Data Structures)

**Responsibility:**
- Defines the structure of data
- Represents real-world entities

**Implementation:**
- `User.cs`
- `WorkerProfile.cs`
- `JobRequest.cs`
- `Contract.cs`

**Description:**
Models represent the core entities of the system and are used across all layers.

---

## Design Patterns Used

### Repository Pattern

The Repository Pattern is used to abstract data access logic from the rest of the application.

- `IRepository<T>` defines the contract
- `FileRepository<T>` implements the data operations

**Benefits:**
- Decouples data access from business logic
- Makes the system easier to maintain and extend

---

### Separation of Concerns

Each layer has a clearly defined responsibility:
- UI → interaction
- Services → logic
- Data → storage
- Models → structure

This improves readability and maintainability.

---

## Data Flow

1. User interacts with the UI (Menu)
2. UI calls methods in Services (UserService)
3. Services use Repository to access data
4. Repository reads/writes data from storage
5. Results are returned back to UI

---

## Design Decisions

### Why layered architecture?
To keep the system modular and easy to maintain.

### Why Repository Pattern?
To separate data access logic and allow flexibility for future changes (e.g., switching from file storage to database).

### Why generic repository?
To reuse the same logic for different models.

---

## Conclusion

The architecture of Punaflow ensures a clean separation of responsibilities, making the project easier to understand, maintain, and extend in the future.
## SOLID Principles Applied

### Dependency Inversion Principle (DIP)

The project applies the Dependency Inversion Principle by ensuring that high-level modules do not depend on low-level implementations.

For example:

- `UserService` depends on `IRepository<User>`
- It does not depend directly on `FileRepository<User>`

This allows the data storage implementation to be changed (e.g., from file-based storage to a database) without modifying the business logic.

**Benefits:**
- Loose coupling
- Easier testing
- Better scalability