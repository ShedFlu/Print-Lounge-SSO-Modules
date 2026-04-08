<?php

declare(strict_types=1);

namespace BrandPrint\SSO;

use InvalidArgumentException;
use RuntimeException;
use DateTimeInterface;
use DateTimeImmutable;

/**
 * BrandPrintSSO
 * Modern PHP module for Brand Print SSO integration (PHP 8.4+).
 */
readonly class BrandPrintSSO
{
    private string $shopUrl;
    private array $payload;

    public function __construct(
        string $shopUrl,
        private string $secretKey,
        private string $algorithm = 'aes-256-cbc',
    ) {
        $this->shopUrl = rtrim($shopUrl, '/');
        $this->payload = [];
    }

    /**
     * Return a new instance with the merged payload (Immutable).
     */
    public function withPayload(array $data): self
    {
        $new = clone $this;
        $new->payload = array_merge($this->payload, $data);
        return $new;
    }

    /**
     * Return a new instance with a single parameter set (Immutable).
     */
    public function withParam(string $key, mixed $value): self
    {
        $new = clone $this;
        $new->payload[$key] = $value;
        return $new;
    }

    private function preparePayload(): string
    {
        $data = $this->payload;

        if (!isset($data['request_time'])) {
            $data['request_time'] = (new DateTimeImmutable())->format(DateTimeInterface::ISO8601);
        }

        if (empty($data['customer_user_name'])) {
            throw new InvalidArgumentException('Mandatory field "customer_user_name" is missing');
        }

        return http_build_query($data);
    }

    private function encrypt(): string
    {
        $queryString = $this->preparePayload();
        
        // Ensure the key length is correct by hashing it
        $key = hash('sha256', $this->secretKey, true);
        
        $ivLength = openssl_cipher_iv_length($this->algorithm);
        $iv = openssl_random_pseudo_bytes($ivLength);
        
        $encrypted = openssl_encrypt(
            $queryString,
            $this->algorithm,
            $key,
            OPENSSL_RAW_DATA,
            $iv
        );

        if ($encrypted === false) {
            throw new RuntimeException('Encryption failed: ' . openssl_error_string());
        }

        // Combine IV + Encrypted Data and Base64 encode
        return base64_encode($iv . $encrypted);
    }

    public function generateUrl(): string
    {
        $h = $this->encrypt();
        return sprintf('%s/sso.php?h=%s', $this->shopUrl, urlencode($h));
    }

    public function generateIframe(array $attributes = []): string
    {
        $url = $this->generateUrl();
        $defaultAttrs = [
            'width' => '100%',
            'height' => '600px',
            'frameborder' => '0',
        ];

        $attrs = array_merge($defaultAttrs, $attributes);
        $attrString = implode(' ', array_map(
            fn($k, $v) => sprintf('%s="%s"', htmlspecialchars($k), htmlspecialchars((string)$v)),
            array_keys($attrs),
            $attrs
        ));

        return sprintf('<iframe src="%s" %s></iframe>', $url, $attrString);
    }
}
