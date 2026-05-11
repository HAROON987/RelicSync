# **App Name**: RelicSync

## Core Features:

- Role-Based Access Control: Secure login and registration for Students and Admins using JDBC to manage distinct session interfaces.
- Item Submission Engine: Comprehensive reporting forms for lost and found items, allowing users to select categories and locations from the database.
- AI Similarity Scorer Tool: A tool that uses generative AI reasoning to analyze item descriptions and generate a match probability score between lost and found records.
- Verification & Claim Hub: A workflow for students to claim items with proof details and for admins to approve, reject, or mark items as 'Handed over'.
- Integrated Notification Service: Automated system alerts for students when matches are detected or when item statuses change, with a dedicated admin notification stream.
- Java-Based Data Visualizations: Interactive graphs and charts implemented in the Java UI to provide an overview of item reports, matches, and success rates.
- JDBC Persistence Layer: Robust data management using Java Database Connectivity (JDBC) to interface with the MySQL project schema.

## Style Guidelines:

- Primary Color: Sharp Slate Blue (#4F46E5) for institutional trust and clarity.
- Surface Color: Clean White (#FFFFFF) for item cards and dashboards to ensure readability.
- Interface Font: 'Inter' or 'Segoe UI' for a clean, modern look suitable for Java desktop applications.
- Functional outline icons used to distinguish between categories like Electronics, Keys, and Documents.
- Multi-pane dashboard layout featuring a sidebar for navigation and a main grid for item lists.
- Subtle UI feedback animations when submitting reports or when administrative status chips change.