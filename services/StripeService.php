<?php
class StripeService {
    private $secret;

    public function __construct() {
        $config = include __DIR__ . '/../config/config.php';
        $this->secret = $config['stripe']['secret_key'] ?? null;
    }

    public function createPaymentIntent($amount, $currency = 'brl') {
        // stub: in real app use \\Stripe\\StripeClient
        return [
            'client_secret' => 'pi_mock_' . bin2hex(random_bytes(8)),
            'amount' => $amount,
            'currency' => $currency
        ];
    }
}
