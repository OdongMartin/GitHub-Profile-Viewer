# GitHub-Profile-Viewer

Overview
GitHub Profile Viewer is a web application that allows users to view GitHub profiles, repositories, and other information. It provides features such as user authentication, documentation, and more.

## Features
GitHub Profile Viewer: Enter a GitHub username to view detailed information about the user, including their avatar, name, bio, email, location, repository stats, and more.

User Authentication: Users can register, log in, and log out. Authenticated users have access to additional features such as changing theme to dark mode

Documentation Section: A concise and accessible documentation section provides users with information on how to use the application effectively.

## Getting Started

### Clone the Repository:

bash

    git clone https://github.com/OdongMartin/github-profile-viewer.git
    
    cd github-profile-viewer

### Install Dependencies:

    bash
    
    npm install

### Set Up Environment Variables:
Create a .env file in the project root and add the following variables:

APIKEY=your_github_api_key
PASS=your_gmail_app_password
EMAIL =your_gmail_email

### Run the Application:

bash

    nodemon server.js

The application will be available at http://localhost:3000.

### Usage

#### GitHub Profile View:
Visit the home page and enter a GitHub username to view detailed information about the user.
![screen shot](./img/readme-img.png)

    User Authentication:
        Register or log in to access additional features like changing themes

    Documentation:
        Visit the documentation page for guidance on using the application.

Contributing
Contributions are welcome! Please follow the contribution guidelines.

License
This project is licensed under the MIT License.
Acknowledgements

    Special thanks to GitHub for providing the GitHub API.
