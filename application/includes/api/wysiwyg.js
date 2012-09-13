/* A Cool HTML5 WYSIWYG Editor */
mw.wysiwyg = {
    _external:function(){  //global element for handelig the iframe tools
      var external = document.createElement('div');
      external.className='wysiwyg_external';
      document.body.appendChild(external);
      return external;
    },
    execCommand:function(a,b,c){
      if(mw.wysiwyg.isThereEditableContent){
         $.browser.mozilla?document.designMode = 'on':'';  // for firefox
         document.execCommand(a,b,c);
         $.browser.mozilla?document.designMode = 'off':'';
      }
    },
    isThereEditableContent:false,
    selection:'',
    _do:function(what){
        mw.wysiwyg.execCommand(what);
    },
    save_selected_element:function(){
        $("#mw-text-editor").addClass("editor_hover");
    },
    deselect_selected_element:function(){
        $("#mw-text-editor").removeClass("editor_hover");
    },
    prepare:function(){
      mw.wysiwyg.external = mw.wysiwyg._external();
      mw.wysiwyg.checker = mw.wysiwyg._checker();
      $("#mw-text-editor").bind("mousedown mouseup click", function(event){event.preventDefault()});
      var items = $(".element").not(".module");
      items.bind("paste", function(event){

          var id = "el_"+mw.random();
          var el = "<div contenteditable='true' id='"+id+"'>&nbsp;</div>";
          mw.wysiwyg.insert_html(el);
          var el = $("#"+id);

         setTimeout(function(){
           var html = el.html();
           var newhtml = mw.wysiwyg.clean_word(html);
           el.html(newhtml)
         },50);
      });

      $(window).bind("onElementMouseDown", function(event, element){
        var el = $(element);
        if(!mw.isDrag && $(".module.element-active").length==0){
          el.attr('contenteditable','true');
          mw.wysiwyg.execCommand('enableObjectResizing', false, 'false');
          if(mw.smallEditor.css("visibility")=='hidden'){
              mw.bigEditor.fadeIn('fast');
          }
          else{
              mw.smallEditor.css("opacity", 1);
          }
          mw.wysiwyg.isThereEditableContent=true;
          el.unbind("change");
          el.bind("change", function(event){
            mw.drag.fix_placeholders(true , el);
          });
          mw.wysiwyg.execCommand('enableObjectResizing', false, 'false');
          event.stopPropagation();
        }
        if($(".module.element-active").length>0){
          $(".module.element-active").parents(".element").attr("contenteditable", false);
          el.blur();
          mw.wysiwyg.isThereEditableContent=false;
        }
        window.location.hash = "#mw_tab_design";
        $("#module_design_selector").setDropdownValue("#tb_el_style", true);
      });

      items.blur(function(){
           if($(".editor_hover").length==0){
              $(this).attr('contenteditable','false');
              mw.wysiwyg.isThereEditableContent=false;
             setTimeout(function(){
               if(mw.smallEditor.css("visibility")=='hidden'){
                 !mw.wysiwyg.isThereEditableContent ? mw.bigEditor.fadeOut('fast') : '';
               }
               else{
                 !mw.wysiwyg.isThereEditableContent ? mw.smallEditor.css("opacity", "0.5") : '';
               }
             }, 100);
           }
      });
      $(".mw_editor").hover(function(){$(this).addClass("editor_hover")}, function(){$(this).removeClass("editor_hover")});


      if (document.createElement("input").webkitSpeech !== undefined) {
         $(".mw_editor").after('<input id="vtest" style="width: 15px; height:20px;border: 0px;background-color:transparent;" type="text" x-webkit-speech="x-webkit-speech" />');
         $("#vtest").mouseenter(function(){
             mw.wysiwyg.save_selection();
         });
         $("#vtest").change(function(){
             mw.wysiwyg.restore_selection();
             mw.wysiwyg.insert_html(this.value);
         });
      }

    },
    init:function(){
      var mw_editor_btns = $(".mw_editor_btn");
      mw_editor_btns.bind("mousedown mouseup click", function(event){
          event.preventDefault();
          if(event.type=='mouseup'){
             var command = this.dataset!=undefined?this.dataset.command:this.getAttribute('data-command');
              if(!command.contains('custom-')){
                 mw.wysiwyg._do(command);
              }
              else{
                var name = command.replace('custom-', "");
                mw.wysiwyg[name]();
              }
              mw.wysiwyg.check_selection();
              $(this).removeClass("mw_editor_btn_mousedown");
          }
          if(event.type=='mousedown'){
              $(this).addClass("mw_editor_btn_mousedown");
          }
      });
      mw_editor_btns.hover(function(){
        $(this).addClass("mw_editor_btn_hover");
      }, function(){
        $(this).removeClass("mw_editor_btn_hover");
      });
      $(document.body).keyup(function(){
         mw.wysiwyg.check_selection();
      });
    },
    applier:function(tag, classname, style_object){
      var range = window.getSelection().getRangeAt(0);
      var selectionContents = range.extractContents();
      var el = document.createElement(tag);
      el.className = classname;
      style_object!=undefined?$(el).css(style_object):'';
      el.appendChild(selectionContents);
      range.insertNode(el);
      return el;
    },
    external_tool:function(el, url){
        var el = $(el).eq(0);
        var offset = el.offset();
        $(mw.wysiwyg.external).css({
          top: offset.top - $(window).scrollTop() + el.height(),
          left:offset.left
        });
        $(mw.wysiwyg.external).html("<iframe src='" + url + "' scrolling='no' frameborder='0' />");
    },
    createelement : function(){
       var el = mw.wysiwyg.applier('div', 'mw_applier element');
       mw.drag.init(el);
       mw.drag.fix_handles();
    },
    fontcolorpicker:function(){
        var el = ".mw_editor_font_color";
        mw.wysiwyg.external_tool(el, mw.external_tool('color_picker') + "#fontColor");
        $(mw.wysiwyg.external).find("iframe").width(360).height(180);
    },
    fontbgcolorpicker:function(){
        var el = ".mw_editor_font_background_color";
        mw.wysiwyg.external_tool(el, mw.external_tool('color_picker') + "#fontbg");
        $(mw.wysiwyg.external).find("iframe").width(360).height(180);
    },
    fontColor:function(color){
       if(mw.wysiwyg.isThereEditableContent){
         mw.wysiwyg.execCommand('forecolor', null, color);
       }
    },
    fontbg:function(color){
       if(mw.wysiwyg.isThereEditableContent){
         mw.wysiwyg.execCommand('backcolor', null, "#"+color);
       }
    },
    fontFamily:function(font_name){
       if(mw.wysiwyg.isThereEditableContent){
         mw.wysiwyg.execCommand('fontname', null, font_name);
       }
    },
    fontSize:function(px){
        var obj = {
          fontSize:px+'px'
        }
        //var el = mw.wysiwyg.applier('span', 'mw_applier', obj);
        mw.wysiwyg.execCommand('fontsize', null, px);
    },
    does_selection_has:function(range,tagname){
      try{
        return $(range.commonAncestorContainer).parents(tagname).length>0 || range.commonAncestorContainer.getElementsByTagName(tagname).length>0;
      }catch(err){return false}
    },
    get_format:function(range){
       try{
        return $(range.commonAncestorContainer).parents("p,h1,h2,h3,h4,h5,h6")[0].tagName.toLowerCase();
      }catch(err){return false}
    },
    get_list:function(range){
       try{
        return $(range.commonAncestorContainer).parents("ul,ol")[0].tagName.toLowerCase();
      }catch(err){return false}
    },
    get_size:function(range){
      try{
        var font_size = $(range.commonAncestorContainer).parents("font").attr("size");
        return font_size!=undefined?font_size:'-1';
      }catch(err){return false}
    },
    get_font_family:function(range){
       try{
        return $(range.commonAncestorContainer).parent().css("fontFamily");
       }catch(err){return false}
    },
    _checker:function(){
        var checker = document.createElement('div');
        checker.className='wysiwyg_checker';
        document.body.appendChild(checker);
        return checker;
    },
    get_alignment:function(range){
        try{
          return  $(range.commonAncestorContainer).parent().css("textAlign");
        }catch(err){return false}
    },
    check_selection:function(){
       var selection = window.getSelection();
       if(mw.wysiwyg.isThereEditableContent && selection.rangeCount>0){
           var range = selection.getRangeAt(0);
           var selection_clone = range.cloneContents();
           $(mw.wysiwyg.checker).empty().append(selection_clone);
           var checker_tags = $(mw.wysiwyg.checker).find("*");
           wys_is_bold = false;
           wys_is_italic = false;
           wys_is_underlined = false;
           if(checker_tags.length==0){
             wys_is_bold = mw.wysiwyg.does_selection_has(range, 'b') || mw.wysiwyg.does_selection_has(range, 'b');
             wys_is_italic = mw.wysiwyg.does_selection_has(range, 'i') || mw.wysiwyg.does_selection_has(range, 'em');
             wys_is_underlined = mw.wysiwyg.does_selection_has(range, 'u');
             wys_is_link = mw.wysiwyg.does_selection_has(range, 'a');
            }
            else{
               checker_tags.each(function(){
                  var tagname = this.tagName.toLowerCase();
                  if(tagname=='b' || tagname =='strong'){
                       wys_is_bold = true;
                  }
                  if(tagname=='i' || tagname =='em'){
                       wys_is_italic = true;
                  }
                  if(tagname=='u'){
                       wys_is_underlined = true;
                  }
                  if(tagname=='a'){
                       wys_is_link = true;
                  }
               });
           }
          wys_is_bold ? $(".mw_editor_bold").addClass("mw_editor_btn_active") : $(".mw_editor_bold").removeClass("mw_editor_btn_active");
          wys_is_italic ? $(".mw_editor_italic").addClass("mw_editor_btn_active") : $(".mw_editor_italic").removeClass("mw_editor_btn_active");
          wys_is_underlined ? $(".mw_editor_underline").addClass("mw_editor_btn_active") : $(".mw_editor_underline").removeClass("mw_editor_btn_active");
          wys_is_link ? $(".mw_editor_link").addClass("mw_editor_btn_active") : $(".mw_editor_link").removeClass("mw_editor_btn_active");

          var format = mw.wysiwyg.get_format(range);
          var font_size = mw.wysiwyg.get_size(range);
          var font_family = mw.wysiwyg.get_font_family(range);

          $(".mw_dropdown_action_format").setDropdownValue(format);
          $(".mw_dropdown_action_font_size").setDropdownValue(font_size);
          $(".mw_dropdown_action_font_family").setDropdownValue(font_family);

          var the_list = mw.wysiwyg.get_list(range);
          if(the_list=='ul'){
            $(".mw_editor_ul").addClass("mw_editor_btn_active");
            $(".mw_editor_ol").removeClass("mw_editor_btn_active");
          }
          else if(the_list=='ol'){
            $(".mw_editor_ol").addClass("mw_editor_btn_active");
            $(".mw_editor_ul").removeClass("mw_editor_btn_active");
          }
          else{
             $(".mw_editor_ol").removeClass("mw_editor_btn_active");
             $(".mw_editor_ul").removeClass("mw_editor_btn_active");
          }

          var align = mw.wysiwyg.get_alignment(range);
          $(".mw_editor_alignment").removeClass("mw_editor_btn_active");
          if(align.contains("right")) {$(".mw_editor_justifyright").addClass("mw_editor_btn_active");}
          else if(align.contains("center")) {$(".mw_editor_justifycenter").addClass("mw_editor_btn_active");}
          else if(align.contains("justify")) {$(".mw_editor_justifyfull").addClass("mw_editor_btn_active");}
          else {$(".mw_editor_justifyleft").addClass("mw_editor_btn_active");}

      }
    },
    link:function(){
        if($(".mw_editor_link.mw_editor_btn_active").length>0){
          if(mw.wysiwyg.selection_length()>0){
             mw.wysiwyg.execCommand('unlink', null, null);
          }
          else{
            var html = $(mw.target.item).html();
            $(mw.target.item).replaceWith(html);
          }
        }
        else{
          if(mw.wysiwyg.isThereEditableContent){
             mw.wysiwyg.save_selection();
             mw.tools.modal.frame({
              url:"rte_link_editor",
              title:"Add/Edit LInk",
              name:"mw_rte_link",
              width:340,
              height:535
            });
         }
      }
    },
    image:function(hash){
        var hash = hash || '';
        if($("#mw_rte_image").length>0){
           $("#mw_rte_image").remove();
        }
        else{
          if(mw.wysiwyg.isThereEditableContent || mw.target.item.className=='image_change'){
              mw.wysiwyg.save_selection();
              mw.tools.modal.frame({
                url:"rte_image_editor"+hash,
                title:"Upload Picture",
                name:"mw_rte_image",
                width:430
              });
          }
        }
    },
    insert_html:function(html){
      if(!document.selection){
         mw.wysiwyg.execCommand('inserthtml', false, html);
      }
      else{
        document.selection.createRange().pasteHTML(html)
      }
    },
    selection_length:function(){
      return (($(mw.wysiwyg.checker).html()).replace(/\s/g, "")).length;
    },
    insert_link:function(url){
      console.log(mw.wysiwyg.selection_length())
      if(mw.wysiwyg.selection_length()>0){
         mw.wysiwyg.execCommand('createlink', false, url);
      }
      else{
         var html = "<a href='" + url + "'>" + url + "</a>";
         mw.wysiwyg.insert_html(html);
      }

    },
    insert_image:function(url, autoclose){
        var autoclose = autoclose || false;
        var id = 'image_' + mw.random();
        var img = '<img id="'+id+'" class="element element-image" src="' + url + '" />';
        mw.wysiwyg.insert_html(img);
        if(autoclose){
           mw.tools.modal.remove('mw_rte_image');
        }
        $("#"+id).attr("contenteditable", false);
        $("#"+id).removeAttr("_moz_dirty");
        mw.disable_selection("#"+id);
        mw.drag.init("#"+id);
        mw.drag.fix_handles();
        mw.image.resize.init("#"+ id);
        mw.wysiwyg.set_cursor('after', "#"+ id + " img");
        mw.wysiwyg.save_selection();
        return id;
    },
    save_selection:function(){
        var selection = window.getSelection();
        var range =  selection.getRangeAt(0);
        mw.wysiwyg.selection = {
          sel:selection,
          range:range,
          element:$('[contenteditable="true"]').eq(0)
        }
    },
    restore_selection:function(){
        mw.wysiwyg.selection.element.attr("contenteditable", "true");
        mw.wysiwyg.selection.element.focus();
        mw.wysiwyg.selection.sel.removeAllRanges()
        mw.wysiwyg.selection.sel.addRange(mw.wysiwyg.selection.range);
        mw.wysiwyg.isThereEditableContent=true;
    },
    format:function(command){
        mw.wysiwyg.execCommand('FormatBlock', false, '<' + command + '>');
    },
    set_cursor : function(before_after, element){
        var range = document.createRange();
        if(before_after=='after'){
           var el = $(element)[0].nextSibling;
           var start = 0;
        }
        else if(before_after=='before'){
           var el = $(element)[0].previousSibling;
           var start = el.data.length;
        }
        range.setStart(el,start);
        range.setEnd(el, start);
        range.collapse(true);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    },
    clean_word:function( html ){

        html = html.replace( /<td([^>]*)>/gi, '<td>' ) ;
        html = html.replace( /<table([^>]*)>/gi, '<table cellspacing="1" cellpadding="1" border="1">' ) ;

    	html = html.replace(/<o:p>\s*<\/o:p>/g, '') ;
    	html = html.replace(/<o:p>[\s\S]*?<\/o:p>/g, '&nbsp;') ;

    	html = html.replace( /\s*mso-[^:]+:[^;"]+;?/gi, '' ) ;

    	html = html.replace( /\s*MARGIN: 0cm 0cm 0pt\s*;/gi, '' ) ;
    	html = html.replace( /\s*MARGIN: 0cm 0cm 0pt\s*"/gi, "\"" ) ;

    	html = html.replace( /\s*TEXT-INDENT: 0cm\s*;/gi, '' ) ;
    	html = html.replace( /\s*TEXT-INDENT: 0cm\s*"/gi, "\"" ) ;

    	html = html.replace( /\s*TEXT-ALIGN: [^\s;]+;?"/gi, "\"" ) ;

    	html = html.replace( /\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"" ) ;

    	html = html.replace( /\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"" ) ;

    	html = html.replace( /\s*tab-stops:[^;"]*;?/gi, '' ) ;
    	html = html.replace( /\s*tab-stops:[^"]*/gi, '' ) ;

        html = html.replace( /\s*face="[^"]*"/gi, '' ) ;
        html = html.replace( /\s*face=[^ >]*/gi, '' ) ;
        html = html.replace( /\s*FONT-FAMILY:[^;"]*;?/gi, '' ) ;

    	html = html.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3") ;

    	html = html.replace( /<STYLE[^>]*>[\s\S]*?<\/STYLE[^>]*>/gi, '' ) ;
    	html = html.replace( /<(?:META|LINK)[^>]*>\s*/gi, '' ) ;

    	html =  html.replace( /\s*style="\s*"/gi, '' ) ;

    	html = html.replace( /<SPAN\s*[^>]*>\s*&nbsp;\s*<\/SPAN>/gi, '&nbsp;' ) ;

    	html = html.replace( /<SPAN\s*[^>]*><\/SPAN>/gi, '' ) ;

    	html = html.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3") ;

    	html = html.replace( /<SPAN\s*>([\s\S]*?)<\/SPAN>/gi, '$1' ) ;

    	html = html.replace( /<FONT\s*>([\s\S]*?)<\/FONT>/gi, '$1' ) ;

    	html = html.replace(/<\\?\?xml[^>]*>/gi, '' ) ;

    	html = html.replace( /<w:[^>]*>[\s\S]*?<\/w:[^>]*>/gi, '' ) ;

    	html = html.replace(/<\/?\w+:[^>]*>/gi, '' ) ;

    	html = html.replace(/<\!--[\s\S]*?-->/g, '' ) ;

    	html = html.replace( /<(U|I|STRIKE)>&nbsp;<\/\1>/g, '&nbsp;' ) ;

    	html = html.replace( /<H\d>\s*<\/H\d>/gi, '' ) ;

    	html = html.replace( /<(\w+)[^>]*\sstyle="[^"]*DISPLAY\s?:\s?none[\s\S]*?<\/\1>/ig, '' ) ;

    	html = html.replace( /<(\w[^>]*) language=([^ |>]*)([^>]*)/gi, "<$1$3") ;

    	html = html.replace( /<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3") ;
    	html = html.replace( /<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3") ;

    	html = html.replace( /<H(\d)([^>]*)>/gi, '<h$1>' ) ;

        html = html.replace(/<font size=2>(.*)<\/font>/gi,'$1') ;
        html = html.replace(/<font size=3>(.*)<\/font>/gi,'$1') ;

        html = html.replace(/<a name=.*>(.*)<\/a>/gi,'$1') ;

        html = html.replace( /<H1([^>]*)>/gi, '<H2$1>' ) ;
        html = html.replace( /<\/H1\d>/gi, '<\/H2>' ) ;


        html = html.replace( /<span>/gi, '$1' ) ;
        html = html.replace( /<\/span\d>/gi, '' ) ;

        html = html.replace( /<(H\d)><FONT[^>]*>([\s\S]*?)<\/FONT><\/\1>/gi, '<$1>$2<\/$1>' );
        html = html.replace( /<(H\d)><EM>([\s\S]*?)<\/EM><\/\1>/gi, '<$1>$2<\/$1>' );

    	return html ;
    }
}





mw.disable_selection = function(element){
    var el = element || ".module";
    var el = $(el, ".edit").not(".unselectable");

    el.attr("unselectable", "on");
    el.addClass("unselectable");
    el.bind("selectstart", function(event){
      event.preventDefault();
      return false;
    });
}


$(mwd).ready(function(){
  $(mwd.body).mousedown(function(event){
    var target = event.target;
    if($(target).hasClass("element")){
      $(window).trigger("onElementMouseDown", target);
    }
    else if($(target).parents(".element").length>0){
      $(window).trigger("onElementMouseDown", $(target).parents(".element")[0]);
    }
  });
});
