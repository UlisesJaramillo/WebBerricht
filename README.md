# WebBerricht

**WebBerricht** is a system designed for managing medical appointments, built following the hexagonal architecture. It connects to the external **Alephoo API** to obtain and manage appointments, patient, and professional data, as well as to cancel appointments. The data retrieved is converted into messages and stored locally in an **SQLite** database.

## Architecture

The project is based on **hexagonal architecture** (also known as ports and adapters), which ensures a clear separation between business logic and external infrastructures (such as APIs and databases). This approach facilitates scalability and system maintainability.

### Main Components:

- **Domain**: Core business logic (entities and use cases).
- **Infrastructure**: Connections to the database and the external API (Alephoo).
- **Application**: Controllers and services that handle HTTP requests and orchestrate the logic.

## Alephoo API

Integration with **Alephoo** is essential for WebBerricht’s functionality. The main actions performed through this API are:

- **Fetching Appointments**: Retrieves available medical appointments.
- **Patient and Professional Data**: Provides detailed information about patients and professionals involved in the appointments.
- **Appointment Cancellation**: Cancels appointments as requested by the patient or the system.

## SQLite Database

All the information retrieved from the Alephoo API, after being processed and transformed into messages, is stored in a local **SQLite** database. The messages contain relevant appointment information and are used to communicate with patients.

## Use Cases

### 1. GetAppointments

This use case connects to the Alephoo API to fetch a list of available medical appointments. The information is processed and transformed into messages that are then stored in the SQLite database.

**Flow**:

1. A request is sent to Alephoo to retrieve appointments.
2. The appointment data is processed and converted into messages.
3. The messages are stored in the local database.

### 2. GetAppointmentsFromDB

This use case retrieves the stored appointments from the **SQLite** database. It is useful for accessing previously processed and saved appointments in the system.

**Flow**:

1. The SQLite database is queried.
2. The stored messages containing appointment information are returned.

### 3. GetResponse

This use case handles receiving patient responses regarding their appointments (confirmation, cancellation, etc.) and updates the database accordingly.

**Flow**:

1. The patient sends a response (e.g., confirmation or cancellation).
2. The system receives and processes the response.
3. The database is updated with the patient's response.

### 4. SendSms

This use case allows sending SMS messages to patients and professionals with relevant information about medical appointments.

**Flow**:

1. A message is generated with the appointment information.
2. The system uses an external SMS API to send the message.
3. The sending is logged in the database.

## Endpoints

WebBerricht offers several **endpoints** to interact with the system:

1. **GET /appointments**: Requests and processes medical appointments from Alephoo.
2. **GET /appointmentsFromDB**: Retrieves stored appointments from the SQLite database.
3. **POST /response**: Receives and processes patient responses.
4. **POST /sendSms**: Sends an SMS with appointment information.

## Technologies Used

- **Node.js** with **TypeScript** for backend development.
- **Express.js** for routing and HTTP request handling.
- **SQLite** as the local database.
- **Axios** to interact with the external Alephoo API.
- **Twilio** (or any other SMS provider) to send SMS messages.

## Conclusion

WebBerricht is a robust solution for managing medical appointments, allowing integration with external APIs, local data storage, and patient communication. The hexagonal architecture ensures clean separation of concerns and makes the system easily extensible for future requirements.
