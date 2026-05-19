<?php
namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Config\Config;

class ConfigTest extends TestCase
{
    protected function setUp(): void
    {
        Config::resetForTesting();
    }

    protected function tearDown(): void
    {
        Config::resetForTesting();
    }

    public function test_lee_jwt_secret_desde_env(): void
    {
        $_ENV['JWT_SECRET'] = 'mi_secret_seguro_de_64_chars_para_test_ok';
        $secret = Config::getJwtSecret();
        $this->assertEquals('mi_secret_seguro_de_64_chars_para_test_ok', $secret);
    }

    public function test_lanza_excepcion_si_jwt_secret_no_definido(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/JWT_SECRET/i');
        unset($_ENV['JWT_SECRET']);
        putenv('JWT_SECRET');
        Config::resetForTesting();
        Config::getJwtSecret();
    }

    public function test_lanza_excepcion_si_jwt_secret_vacio(): void
    {
        $this->expectException(\RuntimeException::class);
        $_ENV['JWT_SECRET'] = '   ';
        Config::resetForTesting();
        Config::getJwtSecret();
    }

    public function test_cachea_el_secret(): void
    {
        $_ENV['JWT_SECRET'] = 'secret_a';
        $first = Config::getJwtSecret();
        $_ENV['JWT_SECRET'] = 'secret_b';
        $second = Config::getJwtSecret();
        $this->assertEquals($first, $second);
        $this->assertEquals('secret_a', $second);
    }

    public function test_reset_limpia_el_cache(): void
    {
        $_ENV['JWT_SECRET'] = 'secret_a';
        Config::getJwtSecret();
        Config::resetForTesting();
        $_ENV['JWT_SECRET'] = 'secret_b';
        $this->assertEquals('secret_b', Config::getJwtSecret());
    }

    public function test_elimina_comillas_del_secret(): void
    {
        $_ENV['JWT_SECRET'] = '"mi_secret_entre_comillas"';
        Config::resetForTesting();
        $secret = Config::getJwtSecret();
        $this->assertEquals('"mi_secret_entre_comillas"', $secret);
    }

    public function test_trim_whitespace_del_secret(): void
    {
        $_ENV['JWT_SECRET'] = '  my_secret_with_spaces  ';
        Config::resetForTesting();
        $secret = Config::getJwtSecret();
        $this->assertEquals('my_secret_with_spaces', $secret);
    }

    public function test_constante_jwt_algo_es_hs256(): void
    {
        $this->assertEquals('HS256', Config::JWT_ALGO);
    }

    public function test_constante_jwt_exp_es_8_horas(): void
    {
        $this->assertEquals(28800, Config::JWT_EXP);
        $this->assertEquals(8 * 3600, Config::JWT_EXP);
    }
}
