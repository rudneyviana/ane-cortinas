<?php
class WpBusinessService {
    private $apiKey;

    public function __construct() {
        $config = include __DIR__ . '/../config/config.php';
        $this->apiKey = $config['whatsapp']['api_key'] ?? null;
    }

    public function sendMessage($to, $message) {
        // stub: implement API call to WhatsApp Business
        return true;
    }
}
