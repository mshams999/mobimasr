!function(n){var t={};function e(i){if(t[i])return t[i].exports;var a=t[i]={i:i,l:!1,exports:{}};return n[i].call(a.exports,a,a.exports,e),a.l=!0,a.exports}e.m=n,e.c=t,e.d=function(n,t,i){e.o(n,t)||Object.defineProperty(n,t,{configurable:!1,enumerable:!0,get:i})},e.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(t,"a",t),t},e.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},e.p="/",e(e.s=584)}({584:function(n,t,e){n.exports=e(585)},585:function(n,t){tinymce.create("tinymce.plugins.ninja_table",{init:function(n,t){n.addButton("ninja_table",{title:"Add Ninja Tables Shortcode",cmd:"ninja_table_action",image:t.slice(0,t.length-2)+"img/ninja-table-editor-button-2x.png"}),n.addCommand("ninja_table_action",function(){n.windowManager.open({title:window.ninja_tables_tiny_mce.title,body:[{type:"listbox",name:"ninja_table_shortcode",label:window.ninja_tables_tiny_mce.label,values:window.ninja_tables_tiny_mce.tables}],width:768,height:100,onsubmit:function(t){if(!t.data.ninja_table_shortcode)return alert(window.ninja_tables_tiny_mce.select_error),!1;n.insertContent('[ninja_tables id="'+t.data.ninja_table_shortcode+'"]')},buttons:[{text:window.ninja_tables_tiny_mce.insert_text,subtype:"primary",onclick:"submit"}]},{tinymce:tinymce})})}}),tinymce.PluginManager.add("ninja_table",tinymce.plugins.ninja_table)}});