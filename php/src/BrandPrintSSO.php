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
/**
 * @phpstan-type BrandPrintSSOPayload array{
 *   request_time?: string,
 *   customer_user_name: string,
 *   customer_user_budgetgruppe__id?: int,
 *   group_customer_number?: string,
 *   group_name?: string,
 *   customer_longname?: string,
 *   customer_firstname?: string,
 *   customer_lastname?: string,
 *   customer_user_businessunit?: string,
 *   customer_user_purchaser?: string,
 *   customer_user_company1?: string,
 *   customer_user_company2?: string,
 *   customer_user_company3?: string,
 *   customer_user_street?: string,
 *   customer_user_zip?: string,
 *   customer_user_town?: string,
 *   customer_user_countrycode?: string,
 *   customer_user_costcenter?: string,
 *   customer_user_telefon?: string,
 *   customer_user_telefax?: string,
 *   customer_user_email?: string,
 *   user_groups_binary_url?: string,
 *   user_groups_binary_description?: string,
 *   customer_user_internet?: string,
 *   customer_user_mobil?: string,
 *   customer_user_kundennummer?: string,
 *   customer_user_level?: 57|58|59|60,
 *   freigabeportal_zeigen?: 53|54,
 *   customer_user_aussendienst?: string,
 *   customer_funktion?: string,
 *   sprache?: 'de'|'en',
 *   customfield1?: string,
 *   customfield2?: string,
 *   customfield3?: string,
 *   customfield4?: string,
 *   customfield5?: string,
 *   delivery_address_editable?: 0|1|2,
 *   dest_page?: 'wg'|'pers'|'article_detail'|'reorder',
 *   dest_id?: string|int,
 *   quantity?: int,
 *   skip_cart?: 53|54,
 *   continue_shopping?: 0|1|2,
 *   pers_data?: string,
 *   test?: bool,
 *   lang?: string,
 *   dynamic_lists?: string,
 *   view_settings?: array<string, mixed>,
 *   email_address_for_cost_release?: string,
 *   external_order_number?: string,
 *   return_url?: string,
 *   settings?: array<string, mixed>,
 *   redirect_url?: string
 * }
 */
class BrandPrintSSO
{
    private string $shopUrl;
    /** @var BrandPrintSSOPayload */
    private array $payload;

    public function __construct(
        string $shopUrl,
        private string $secretKey,
        private string $algorithm = 'aes-256-cbc',
    ) {
        $this->shopUrl = rtrim($shopUrl, '/');
        /** @phpstan-ignore-next-line */
        $this->payload = [];
    }

    /**
     * Return a new instance with the merged payload (Immutable).
     * @param BrandPrintSSOPayload|array<string, mixed> $data
     */
    public function withPayload(array $data): self
    {
        $new = clone $this;
        $new->payload = array_merge($this->payload, $data);
        return $new;
    }

    /**
     * Return a new instance with a single parameter set (Immutable).
     * @template K of key-of<BrandPrintSSOPayload>
     * @param K $key
     * @param BrandPrintSSOPayload[K]|mixed $value
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

        $iv = substr( hash( 'sha256', $this->secretKey ), 0, 16 );

        $encrypted = openssl_encrypt(
            $queryString,
            $this->algorithm,
            $this->secretKey,
            0,
            $iv
        );

        if ( $encrypted === false ) {
            throw new RuntimeException( 'Encryption failed: ' . openssl_error_string() );
        }

        return $encrypted;
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
