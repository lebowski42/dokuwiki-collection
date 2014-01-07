/**
 * jQuery-stuff to handle tabs and portlets
 * 
 * @license    GPL 3 (http://www.gnu.org/licenses/gpl.html)
 * @author     Martin Schulte <lebowski[at]corvus[dot]uberspace[dot]de>, 2013
 */

/* DOKUWIKI:include_once lib/jstree/jquery.jstree.js */
/* DOKUWIKI:include_once lib/jstree/_lib/jquery.hotkeys.js */
/* DOKUWIKI:include_once lib/jquery.layout.js */



var collection_tree = {
	start: function(){
		jQuery.jstree._themes = DOKU_BASE + "lib/plugins/collection/lib/themes/",
		jQuery(".collection_tree").jstree({
			"core" : { "initially_open" : [ "phtml_1" ] },
			"html_data": {
				"ajax" : {
				"url" :  DOKU_BASE + "lib/plugins/collection/ajax/getCollection.php",
				"data" : function (n) { 
					return { id : n.attr ? n.attr("id") : 0 }; 
				}
			}
				},
			"themes" : {
				"theme" : "collection",
				"dots" : true,
				"icons" : true
			},
			"ui" : {
			    "select_limit" : 1
			},
			"types" : {
				"max_depth" : -1,
				"max_children" : -1,
				"types": {
					"default" : {
						"icon" : {
							"image" : DOKU_BASE + "/lib/plugins/collection/lib/jstree/file.png"
						},
						"valid_children" : ["none"],
					},
					"folder" : {
						"icon" : {
							"image" : DOKU_BASE + "/lib/plugins/collection/lib/jstree/folder.png"
						},
						"valid_children" : [ "default", "folder" ],
					}
				}
			},
			"contextmenu": {
				"select_node": true,
				"items":{
					"remove" : {
						"label": "Löschen",
						"action": function (obj) { 
										var really = confirm("Wirklich löschen?");
										if(really) this.remove(obj); 
									}
					},
					"rename" : {
						"label": "Umbennen"
					},
					"create" : {
						"label": "Neu",
						"submenu": {
							"newFolder":{
								"label": "Ordner",
								"action": function (obj) { jQuery(".collection_tree").jstree("create", null, "last", { "attr" : { "rel" : "folder" } }); }
							},
							"newPage":{
								"label": "Seite",
								"action": function (obj) { jQuery(".collection_tree").jstree("create", null, "last", { "attr" : { "rel" : "default" } }); }
							}
						}
					}
				}
			},
			"plugins" : [ "themes", "html_data","dnd","ui","types", "crrm","contextmenu","hotkeys" ]
		}).bind("select_node.jstree", function(event, data) {
			var rightpane = jQuery(".collection_tree").parent().next();
			var personal = data.rslt.obj.children('div');
			var page = personal.children('.collection_wikipage').html();
			var header = "<h3>"+data.rslt.obj.children('a').text()+"</h3>";
			var link = "<div class=\"link\">verknüpfte Wikiseite: <a title=\""+page+"\" href=\"" + DOKU_BASE + page + "\">"+page+"</a></div>";
			rightpane.html(header+link+personal.children('.collection_notes').html());
			//alert(jQuery(".collection_tree").html());
			 dw_linkwiz.init(rightpane);
			 
			dw_linkwiz.toggle();
			return false;
			});
	}
};

var collection_menubar = {
	start: function () {
			jQuery(".mmenu input").click(function () {
				switch(this.id) {
					case "add_default":
					case "add_folder":
						jQuery(".collection_tree").jstree("create", null, "last", { "attr" : { "rel" : this.id.toString().replace("add_", "") } });
						break;
					case "search":
						jQuery(".collection_tree").jstree("search", document.getElementById("text").value);
						break;
					case "text": break;
					default:
						jQuery(".collection_tree").jstree(this.id);
						break;
				}
			});
	}
};

var collection_resizable = {
	start: function(){
		jQuery(".collection_resizeable").resizable({
			handles: "e" ,
			resize: function (event,ui){
							ui.position.left = ui.originalPosition.left;
							ui.size.width = (ui.size.width - ui.originalSize.width )*2 +ui.originalSize.width;
					}
		 });
		jQuery(".collection_container").resizable({ 
			handles: "s",
		 });
    }
};

var collection_editdialog = {
	start: function(){
		jQuery(document.createElement('div')).dialog({
			autoOpen: true,
			height: 300,
			width: 350,
			modal: true,
			buttons: {
				"Create an account": function() {
						var bValid = true;
							allFields.removeClass( "ui-state-error" );
				/*bValid = bValid && checkLength( name, "username", 3, 16 );
				bValid = bValid && checkLength( email, "email", 6, 80 );
				bValid = bValid && checkLength( password, "password", 5, 16 );
				bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
				// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
				bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
				bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );*/
				if ( bValid ) {
					jQuery( "#users tbody" ).append( "<tr>" +
					"<td>" + name.val() + "</td>" +
					"<td>" + email.val() + "</td>" +
					"<td>" + password.val() + "</td>" +
					"</tr>" );
					jQuery( this ).dialog( "close" );
				}
				},
				
				Cancel: function() {
					jQuery( this ).dialog( "close" );
				}
			},
			
			close: function() {
				allFields.val( "" ).removeClass( "ui-state-error" );
			}
		});	
		
		// jQuery( "#create-user" ).button().click(function() {
			//jQuery( "#dialog-form" ).dialog( "open" );
		//	});			
	}
};



jQuery(document).ready(function() {
	if(window.collectionOnThisSide){
		collection_tree.start();
		collection_menubar.start();
		collection_resizable.start();
		collection_editdialog.start();
		jQuery( "#dialog-form" ).dialog( "open" );
	}
	
});


