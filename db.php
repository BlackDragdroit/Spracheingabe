<?php
// build the DSN including SSL settings
$conn = "mysql:host=localhost;dbname=web010";
try {
$db = new PDO($conn, "web010", "X8p59h?e");

// Create table if not exists
$db->exec("CREATE TABLE IF NOT EXISTS speechrecognitionwords (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(255) NOT NULL
)");

// ... existing code ...
} catch (Exception $e) {
echo "Error: " . $e->getMessage();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the data from the request
    $word = $_POST['word'];

    // Prepare an SQL statement
    $stmt = $db->prepare("INSERT INTO speechrecognitionwords (word) VALUES (:word)");

    // Bind parameters
    $stmt->bindParam(':word', $word);

    // Execute the statement
    $stmt->execute();
}