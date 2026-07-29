<?php
declare(strict_types=1);

const USER_SESSION_NAME = 'lorluean_user_session';

function user_auth_cookie_options(int $expires = 0): array
{
    return [
        'expires' => $expires,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ];
}

function user_auth_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1');
    session_name(USER_SESSION_NAME);
    session_set_cookie_params(user_auth_cookie_options());
    session_start();
}

function user_auth_current_id(): ?int
{
    user_auth_start_session();
    $id = filter_var($_SESSION['user_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    return $id ?: null;
}

function user_auth_login_session(int $userId): void
{
    user_auth_start_session();
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    setcookie(session_name(), session_id(), user_auth_cookie_options());
}

function user_auth_logout(): void
{
    user_auth_start_session();
    $_SESSION = [];
    setcookie(session_name(), '', user_auth_cookie_options(time() - 3600));
    session_destroy();
}
