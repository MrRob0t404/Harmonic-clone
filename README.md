# Notes:

These notes will layout the assumptions I've made before the project and future features

## Assumptions:

- User Authentication and Authorization:
  Users must be authenticated to interact with the lists and add companies.
  Different users may have different permissions or access levels regarding adding companies. (out of scope for this project)

- Data Structure:
  Each company in the lists has a unique identifier (ID) that allows for easy tracking.
  The application maintains two lists: “My List” and “Liked Companies,” which can hold a potentially large number of companies.

- UI/UX Considerations:
  Users should be able to view their selection before confirming the addition to minimize mistakes.

- Performance Management:
  Given the potential for large-scale actions (like adding many companies), the application should implement pagination or lazy loading for the lists to improve load time and user experience.
  A loading indicator or progress bar should be shown when processing large actions to keep the user informed.

- Error Handling:
  The system should gracefully handle errors (e.g., if some companies fail to add) and provide feedback to the user.
  There should be a way to retry failed operations.

- User Feedback:
  Provide visual feedback (e.g., notifications) after successful additions or errors.
  Users should be able to undo actions within a reasonable time frame after the addition.

- Scalability:
  The solution should be designed to accommodate future scalability, allowing for more complex interactions with lists and companies.

- Database Considerations:
  The database schema should be optimized for read/write operations, especially considering the potential size of the lists.
  Ensure that the database can efficiently handle batch insert operations while respecting the throttle limits.

- Testing:
  The implementation should include unit tests for both the front-end and back-end to verify functionality and performance under different scenarios (e.g., adding a few companies vs. adding many).

## The Future:

- Add unit tests / intergration tests to verify functionality and performance.
- Optimize query to add all companies to Liked Companies list (it takes too long)
- Provide a more robust way to notify the user of the current action they're doing

## Demo:

[High level overview of my changes](https://www.loom.com/share/16d4a2681d37442cad7a9b285fb33217?sid=dc626156-b38b-4703-a0c2-5bc48a44a564)

[Demo!](https://www.loom.com/share/80d7c4d59dcf4030a6c15ab6e385d12e?sid=44e4da78-4069-468c-bb24-0ffe7e07aa9e)
