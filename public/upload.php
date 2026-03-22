<?php
/**
 * PHP Upload Endpoint for Basal Admin
 * Receives file via POST multipart/form-data
 * Returns JSON with file URL
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST requests allowed']);
    exit;
}

if (!isset($_FILES['file'])) {
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$uploadDir = 'uploads/'; // Make sure this directory exists and is writable (chmod 777 or 755)

// Create directory if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate a unique filename to avoid overwrites
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$safeName = ($extension === 'mp3' ? 'songs' : 'images') . uniqid() . '.' . $extension;
$destination = $uploadDir . $safeName;

// Validate file type (optional but recommended)
$allowedExtensions = ['mp3', 'wav', 'm4a', 'jpg', 'jpeg', 'png', 'webp'];
if (!in_array(strtolower($extension), $allowedExtensions)) {
    echo json_encode(['error' => 'Unsupported file type']);
    exit;
}

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Construct the full URL
    // IMPORTANT: Change this to your actual server domain
    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . dirname($_SERVER['PHP_SELF']) . '/';
    $fileUrl = $baseUrl . $destination;
    
    echo json_encode([
        'status' => 'success',
        'url' => $fileUrl,
        'filename' => $safeName
    ]);
} else {
    echo json_encode(['error' => 'Failed to move uploaded file. Check directory permissions.']);
}
?>
