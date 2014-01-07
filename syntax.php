<?php
/**
 *
 * Syntax: ~~COLLECTION:name~~
 * 
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     Martin Schulte <lebowski[at]corvus[dot]uberspace[dot]de>
 */



// must be run inside dokuwiki
if(!defined('DOKU_INC')) die();
if (!defined('DOKU_LF')) define('DOKU_LF', "\n");
if (!defined('DOKU_TAB')) define('DOKU_TAB', "\t");
/**
 * All DokuWiki plugins to extend the parser/rendering mechanism
 * need to inherit from this class
 */
class syntax_plugin_collection extends DokuWiki_Syntax_Plugin {

    /**
     * return some info
     */
    function getInfo(){
        return array(
            'author' => 'Martin Schulte',
            'email'  => '<lebowski[at]corvus[dot]uberspace[dot]de>',
            'date'   => '2013-09-29',
            'name'   => 'collection Plugin',
            'desc'   => 'Create and display a collection of wikipages',
            'url'    => 'http://dokuwiki.org/plugin:collection',
        );
    }
   

   /**
     * What kind of syntax are we?
     */
    function getType(){
        return 'substition';
    }

   /**
    * Where to sort in?
    */
    function getSort(){
        return 999;
    }

    /**
     * Close open paragraphs before
     */
    function getPType(){
        return 'block';
    }


   /**
    * Connect lookup pattern to lexer.
    */
    function connectTo($mode) {                                        
      $this->Lexer->addSpecialPattern('~~COLLECTION[:]?[a-zA-Z&=]*~~',$mode,'plugin_collection');
      $this->Lexer->addSpecialPattern('~~MYCOLLECTION[:]?[a-zA-Z&=]*~~',$mode,'plugin_collection');
      $this->Lexer->addSpecialPattern('~~OURCOLLECTION[:]?[a-zA-Z&=]*~~',$mode,'plugin_collection');
    }
	

    /**
    * Handler to prepare matched data for the rendering process.
    *
    * @param $match String The text matched by the patterns, somthing like ~~AUTHORS:displayaslist&tooltip=fullname...~~
    * @param $state Integer The lexer state for the match, doesn't matter because we only substitute.
    * @param $pos Integer The character position of the matched text.
    * @param $handler Object reference to the Doku_Handler object.
    * @return Integer The current lexer state for the match.
    */
    function handle($match, $state, $pos, &$handler){
		if(strtolower(substr($match,2,10)) == 'collection'){
			$data['collection'] = strtolower(substr($match,12,-2)); //strip ~~COLLECTION: from start and ~~ from end
			$data['type'] = 'public';
		}else{
			if(strtolower(substr($match,2,2)) == 'my'){
			    $data['collection'] = strtolower(substr($match,14,-2));
			    $data['type'] = 'user';	
			}else{
				$data['collection'] = strtolower(substr($match,15,-2));
			    $data['type'] = 'group';	
			}
		}
        return $data;
    }

   /**
    * Render the collection. 
    */
    function render($mode, &$renderer, $data) {
		// Only if XHTML
        if($mode == 'xhtml'){
			global $INFO;
			/*$al = &plugin_load('helper', 'authorlist'); // A helper_plugin_authorlist object
			if (!$al) return false; // Everything went well?
			$al->setOptions($INFO['id'],$data);	// Set options. Data was created by the handle-mode. If empty, default are used.
			$al->fetchAuthorsFromMetadata();
			$al->sortAuthors();
            $al->startList();
			$al->renderAllAuthors();
            $al->finishList();
            $renderer->doc .= $al->getOutput();*/
            $renderer->doc .= '<div class="mmenu">
<input type="button" id="add_folder" value="add folder"/>
<input type="button" id="add_default" value="add file"/>
<input type="button" id="rename" value="rename"/>
<input type="button" id="remove" value="remove"/>
<input type="button" id="cut" value="cut"/>
<input type="button" id="copy" value="copy"/>
<input type="button" id="paste" value="paste"/>
<input type="button" id="clear_search" value="clear"/>
<input type="button" id="search" value="search"/>
<input type="text" id="text" value=""/>
</div>';
$renderer->doc .= '<div style="clear:both;"></div>';
$renderer->doc .= '<div class="collection_container">
					<div class="collection_resizeable" >
						<div class="collection_tree" >
						</div>
					</div>
					<div class="collection_desc">
					</div>
				  </div>';
            $renderer->doc .= '<div style="clear:both;"></div>';
            $renderer->doc .= DOKU_TAB.'<script type="text/javascript"> window.collectionOnThisSide = true;	</script>'.DOKU_LF;
		

            return true;
        }

        return false;
    }
}
?>
