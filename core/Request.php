<?php
class Request {
    public $method;
    public $body;
    public $query;
    public $headers;

    public function __construct() {
        $this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $this->query = $_GET ?? [];
        $this->headers = getallheaders();

        $input = file_get_contents('php://input');
        $this->body = json_decode($input, true) ?? $_POST;
    }
}
