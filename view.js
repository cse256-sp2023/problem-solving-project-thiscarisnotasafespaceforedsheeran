// ---- Define your dialogs  and panels here ----

let files = [];
// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)
    files.push(file_hash);
    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



var effective_container = define_new_effective_permissions("effective-panel", true);
let header = $(`<h3>Check a user's permissions:</h3>`);
$('#sidepanel').append(header);
let question = $(`<h5> how do I use this? </h5>`);
question.css('border-style', 'solid');
question.css('padding', '5px');
question.css('width', 'fit-content');

question.hover(()=>{
    question.css('background-color', '#147fff');
    question.css('color', 'white');
    question.css('cursor', 'pointer');
})
question.mouseout(()=>{
    question.css('background-color', 'white');
    question.css('color', 'black');

}
)
let q_dialog = define_new_dialog("question_dialog", "Permission Checker Information");
let content_string = `<div>
To use this feature, select a user and file to check the permissions for!<br><br>
If you change permissions after intially selecting the user and file, click the refresh button to see your changes.<br><br>
 A checkmark will appear next to the permissions that the user has on that file!<br><br>
 To get more information on why or why not a permission is checked, click the i button next to the permission.<br><br>
 It will give you where the permissions are coming from!
 </div>`;
q_dialog.append(content_string)
// q_dialog.value = "asklfjaslf";
$('#sidepanel').append(question);
question.click(()=>{
    q_dialog.dialog('option', 'height', 450);
    q_dialog.dialog('open');

})

var select_user_field = define_new_user_select_field("effective-panel", "select user", function(selected_user){
    $('#effective-panel').attr('username', selected_user);
});
var select_file_field = pick_file(files, "select file", function(newfile) {
    $('#effective-panel').attr('filepath', newfile);
});
$('#sidepanel').append(select_user_field);
$('#sidepanel').append(select_file_field);
let refresh = $(`<input type="button" value="refresh" id="refresh"/>`);
refresh.click(()=>{
    $('#effective-panel').attr('username', $('#effective-panel_field').attr('selected_user'));
    $('#effective-panel').attr('filepath', $('#pick-file_field').attr('selected_file'));
    effective_container = define_new_effective_permissions("effective-panel", true);
})
// add the container we just made to the page
$('#sidepanel').append(refresh);
$('#sidepanel').append(effective_container);
var dialog = define_new_dialog("effective-panel");
// now give functionality to the little buttons
$('.perm_info').hover(()=>{
    $('.perm_info').css('cursor', 'pointer');
})
$('.perm_info').click(function(){
    console.log($('#effective-panel').attr('filepath') + ", " + $('#effective-panel').attr('username') + ", " + $(this).attr('permission_name'));
    var exp_object = allow_user_action(path_to_file[$('#effective-panel').attr('filepath')], all_users[$('#effective-panel').attr('username')], $(this).attr('permission_name'), true);
    var exp_string = get_explanation_text(exp_object);
    dialog.text(exp_string);
    dialog.dialog('open');
});


let folder = $('.folder_contents');



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 