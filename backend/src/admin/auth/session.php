<?php
declare(strict_types=1);

const ADMIN_SESSION_NAME = 'lorluean_admin_session';
const ADMIN_REMEMBER_SECONDS = 60 * 60 * 24 * 30;

function admin_auth_cookie_options(int $expires = 0): array
{
    return [
        'expires' => $expires,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ];
}

function admin_auth_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string) ADMIN_REMEMBER_SECONDS);
    session_name(ADMIN_SESSION_NAME);
    session_set_cookie_params(admin_auth_cookie_options());
    session_start();
}

function admin_auth_current_id(): ?int
{
    admin_auth_start_session();
    $id = filter_var($_SESSION['admin_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $expiresAt = (int) ($_SESSION['admin_expires_at'] ?? 0);
    if ($expiresAt && $expiresAt < time()) {
        admin_auth_logout();
        return null;
    }
    return $id ?: null;
}

function admin_auth_login_session(int $adminId, bool $remember): void
{
    admin_auth_start_session();
    session_regenerate_id(true);
    $_SESSION['admin_id'] = $adminId;
    if ($remember) {
        $expiresAt = time() + ADMIN_REMEMBER_SECONDS;
        $_SESSION['admin_expires_at'] = $expiresAt;
        setcookie(session_name(), session_id(), admin_auth_cookie_options($expiresAt));
        return;
    }
    unset($_SESSION['admin_expires_at']);
    setcookie(session_name(), session_id(), admin_auth_cookie_options());
}

function admin_auth_logout(): void
{
    admin_auth_start_session();
    $_SESSION = [];
    setcookie(session_name(), '', admin_auth_cookie_options(time() - 3600));
    session_destroy();
}
