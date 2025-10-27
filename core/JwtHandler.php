<?php
class JwtHandler {
    private $secret;

    public function __construct() {
        $config = include __DIR__ . '/../config/config.php';
        $this->secret = $config['jwt']['secret'] ?? 'change_me';
    }

    public function generate(array $payload, $exp = 3600) {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload['exp'] = time() + $exp;

        $base64UrlHeader = $this->base64UrlEncode(json_encode($header));
        $base64UrlPayload = $this->base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "$base64UrlHeader.$base64UrlPayload", $this->secret, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";
    }

    public function validate($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;
        list($headerB64, $payloadB64, $signatureB64) = $parts;

        $payload = json_decode($this->base64UrlDecode($payloadB64), true);
        if (!$payload) return false;
        if (isset($payload['exp']) && time() > $payload['exp']) return false;

        $expectedSig = $this->base64UrlEncode(hash_hmac('sha256', "$headerB64.$payloadB64", $this->secret, true));
        return hash_equals($expectedSig, $signatureB64);
    }

    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) $data .= str_repeat('=', 4 - $remainder);
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
