CREATE DATABASE IF NOT EXISTS Gestion_Contact;
USE Gestion_Contact;

CREATE TABLE Utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_pass VARCHAR(255) NOT NULL
);

CREATE TABLE Contact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE Note (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_id INT,
    contenu TEXT NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES Contact(id) ON DELETE CASCADE
);
