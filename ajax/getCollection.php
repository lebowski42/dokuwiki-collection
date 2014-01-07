<?php
/**
 * @license    GPL 3 (http://www.gnu.org/licenses/gpl.html)
 * @author     Martin Schulte <lebowski[at]corvus[dot]uberspace[dot]de>, 2013
 */

// Prepare
global $conf;

if(!defined('DOKU_INC')) define('DOKU_INC', dirname(__FILE__).'/../../../../');
define('DOKU_DISABLE_GZIP_OUTPUT', 1);
// $conf and classpathes

$content = file_get_contents(DOKU_INC."data/collection/user/john.txt");
echo $content;
file_put_contents("antwort.txt",$content);


?>




