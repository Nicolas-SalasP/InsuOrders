<?php
namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Middleware\AuthMiddleware;

class AuthMiddlewareTest extends TestCase
{
    protected function setUp(): void
    {
        $ref = new \ReflectionProperty(AuthMiddleware::class, 'currentUser');
        $ref->setAccessible(true);
        $ref->setValue(null, null);
    }

    public function test_getCurrentUserId_retorna_null_sin_usuario(): void
    {
        $this->assertNull(AuthMiddleware::getCurrentUserId());
    }

    public function test_getCurrentUserId_retorna_id_del_usuario_actual(): void
    {
        $user = new \stdClass();
        $user->id  = 42;
        $user->rol = 'Tecnico';

        $ref = new \ReflectionProperty(AuthMiddleware::class, 'currentUser');
        $ref->setAccessible(true);
        $ref->setValue(null, $user);

        $this->assertEquals(42, AuthMiddleware::getCurrentUserId());
    }

    public function test_getCurrentUserId_retorna_int_no_string(): void
    {
        $user = new \stdClass();
        $user->id  = '15';
        $user->rol = 'Bodeguero';

        $ref = new \ReflectionProperty(AuthMiddleware::class, 'currentUser');
        $ref->setAccessible(true);
        $ref->setValue(null, $user);

        $result = AuthMiddleware::getCurrentUserId();
        $this->assertIsInt($result);
        $this->assertEquals(15, $result);
    }

    public function test_getUser_retorna_null_sin_usuario(): void
    {
        $this->assertNull(AuthMiddleware::getUser());
    }

    public function test_getUser_retorna_objeto_usuario_completo(): void
    {
        $user = new \stdClass();
        $user->id       = 7;
        $user->rol      = 'Admin';
        $user->permisos = ['inv_ver', 'mant_ver'];

        $ref = new \ReflectionProperty(AuthMiddleware::class, 'currentUser');
        $ref->setAccessible(true);
        $ref->setValue(null, $user);

        $result = AuthMiddleware::getUser();
        $this->assertEquals(7, $result->id);
        $this->assertEquals('Admin', $result->rol);
    }

    public function test_getCurrentUserId_retorna_null_si_no_tiene_propiedad_id(): void
    {
        $user = new \stdClass();
        $user->rol = 'Operario';

        $ref = new \ReflectionProperty(AuthMiddleware::class, 'currentUser');
        $ref->setAccessible(true);
        $ref->setValue(null, $user);

        $this->assertNull(AuthMiddleware::getCurrentUserId());
    }
}
