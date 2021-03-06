Blog.Admin = {
    init: function(){
	// Override x-editable buttons
	$.fn.editableform.buttons = '<button class="blog-edit-control clickable editable-submit"><i class="icon-ok"></i></button>\
				     <button class="blog-edit-control clickable editable-cancel"><i class="icon-remove"></i></button>';
	this.bindUIActions();
    },
    bindUIActions: function(){
	$('#post_btn').click(this.createPost);
	$('.delete-post').click(function(){
	    $post = $(this);
	    $post_id = $post.attr('data-post-id');
	    $post.addClass('deleteable-post');
	    $('#delete_modal').modal();
	});
	$('#delete_confirm').click(this.deletePost);
	$('#update_post_btn').click(this.editPost);
	$('.comment-btn').click(this.editComment);
	$('#link_add_trigger').click(function(){
	   $('#link_add_modal').modal(); 
	});
	$('#link_add').click(this.createLink);
	$('.delete-link').click(this.deleteLink);
	$('.edit-link').editable({'mode': 'inline',
				'url': this.editLink,
				'clear': false,
				'placeholder': 'Click to edit...',
				'tpl': '<input type="text" class="input-medium input-small-height"/>'
	});
	$('.edit-settings').editable({'mode': 'inline',
				'url': this.editSettings,
				'clear': false,
				'tpl': '<input type="text" class="input-medium input-small-height"/>'
	});
	$('.edit-settings-select').editable({'mode': 'inline',
					    'url': this.editSettings
	});
	$('.edit-user').editable({'mode': 'inline',
				'url': this.editUser,
				'clear': false,
				'tpl': '<input type="text" class="input-medium input-small-height"/>'
	});
	$('#user_add_trigger').click(function(){
	    $('#user_add_modal').modal(); 
	});
    },
    createPost: function(){
	$elements = {
	    'entry_title': {'required': 1, 'err_msg': 'a post title', 'clear_value': 1},
	    'entry_body': {'required': 1, 'err_msg': 'a post title', 'clear_value': 1},
	    'entry_tags': {'required': 0, 'err_msg': 'post tags', 'clear_value': 1},
	    'entry_status': {'required': 1, 'err_msg': 'a post status', 'clear_value': 0},
	    'entry_type': {'required': 1, 'err_msg': 'a post type', 'clear_value': 0},
	};
	$new_post = Blog._parseElements($elements, 'post_output');
	if (!$new_post)
	    return false;
	$.ajax({
	    url: '/api/v1/post',
	    type: 'POST',
	    contentType: 'application/json; charset=utf-8',
	    data: JSON.stringify($new_post),
	    error: Blog._error,
	    success: function($return_data) {
		if($return_data.error){
		    $('#post_output').html($return_data.error);
		    $('#post_output').fadeIn();
		}else{
		    window.location = '/' + $return_data['location'];
		}
	    }
	});
	return false;
    },
    deletePost: function(){
	$.ajax({
	    url: '/api/v1/post/'+ $('.deleteable-post').attr('data-post-id'),
	    type: 'DELETE',
	    contentType: 'application/json; charset=utf-8',
	    error: Blog._error,
	    success: function($return_data) {
		if($return_data.error){
		    alert($return_data.error);
		}else{
		    $tr = $('.deleteable-post').closest('tr');
		    $tr.fadeOut(400, function(){
			$tr.remove();
		    });
		}
	    }
	});
    },
    editPost: function(){
	$elements = {
	    'entry_title': {'required': 1, 'err_msg': 'a post title', 'clear_value': 1},
	    'entry_body': {'required': 1, 'err_msg': 'a post title', 'clear_value': 1},
	    'entry_tags': {'required': 0, 'err_msg': 'post tags', 'clear_value': 1},
	    'entry_status': {'required': 1, 'err_msg': 'a post status', 'clear_value': 0},
	    'entry_type': {'required': 1, 'err_msg': 'a post type', 'clear_value': 0},
	};
	$edit_post = Blog._parseElements($elements, 'post_output');
	if (!$edit_post)
	    return false;
	$.ajax({
	    url: '/api/v1/post/' + $('#entry_id').val(),
	    type: 'PUT',
	    contentType: 'application/json; charset=utf-8',
	    data: JSON.stringify($edit_post),
	    error: Blog._error,
	    success: function($return_data) {
		if($return_data.error){
		    $('#post_output').html($return_data.error);
		    $('#post_output').fadeIn();
		}else{
		    window.location = '/' + $return_data['location'];
		}
	    }
	});
    },
    editComment: function(){
	$comment_el = $($(this).closest('.comment'));
	$comment_id = $comment_el.attr('data-comment-id');
	$post_id = $comment_el.attr('data-post-id');
	$comment_approval = this.getAttribute('data-approval');
	$.ajax({
	    url: '/api/v1/post/' + $post_id + '/comment/' + $comment_id,
	    type: ($comment_approval == '1') ? 'PUT' : 'DELETE',
	    contentType: 'application/json; charset=utf-8',
	    error: Blog._error,
	    success: function($return_data) {
		if($return_data.error){
		    alert($return_data.error);
		}else{
		    $comment_el.fadeOut(400, function(){
			$comment_el.remove();
		    });
		    setTimeout(function(){
			if(!$('.comment').length){
			    $blog_comments = $('.blog-comments');
			    $blog_comments.hide();
			    $msg = $('<h4>');
			    $msg.html('No comments pending approval');
			    $blog_comments.html($msg);
			    $blog_comments.fadeIn();
			}
		    }, 500);
		}
	    }
	});
    },
    createLink: function(){
	$elements = {
	    'link_url': {'required': 1, 'err_msg': 'a URL', 'clear_value': 1},
	    'link_title': {'required': 1, 'err_msg': 'a title', 'clear_value': 1}
	};
	$add_link = Blog._parseElements($elements, 'link_output');
	if (!$add_link)
	    return false;
	$.ajax({
	    url: '/api/v1/link',
	    type: 'POST',
	    data: JSON.stringify($add_link),
	    contentType: 'application/json; charset=utf-8',
	    error: Blog._error,
	    success: function($return_data) {
		console.log($return_data);
		if($return_data.error){
		    alert($return_data.error);
		}else{
		    //@todo: Don't reload
		    location.reload();
		}
	    }
	});
	return false;
    },
    deleteLink: function(){
	$data_row = $($(this).closest('tr'));
	$link_id = $data_row.attr('data-link-id');
	$.ajax({
	    url: '/api/v1/link/' + $link_id,
	    type: 'DELETE',
	    contentType: 'application/json; charset=utf-8',
	    success: function($return_data) {
		if($return_data.error){
		    alert($return_data.error);
		}else{
		    $link = $($data_row.find('.link-url'));
		    $.each($($('.nav').find('a')), function(num, item){
			$a = $(item);
			if($a.attr('href') == $link.html()){
			    $li = $a.closest('li');
			    $li.fadeOut(400, function(){
				$li.remove();
			    });
			    return false;
			}
		    });
		    $data_row.fadeOut(400, function(){
			$data_row.remove();
		    });
		}
	    }
	});
    },
    editLink: function(params){
	$data_row = $($(this).closest('tr'));
	$link_id = $data_row.attr('data-link-id');
	$edit_link = {};
	$edit_link[params.name] = params.value;
	$.ajax({
	    url: '/api/v1/link/' + $link_id,
	    type: 'PUT',
	    data: JSON.stringify($edit_link),
	    contentType: 'application/json; charset=utf-8',
	    success: function($return_data) {
		if($return_data.error){
		    alert($return_data.error);
		}else{
		    $link = $($data_row.find('.link-url'));
		    $title = $($data_row.find('.link-title'));
		    $.each($($('.nav').find('a')), function(num, item){
			$a = $(item);
			if($a.attr('href') == $link.html() || $a.html() == $title.html()){
			    $a.attr('href', $link.html());
			    $a.html($title.html());
			    return false;
			}
		    });
		}
	    }
	});
	return false;
    },
    editSettings: function(params){
	$.ajax({
	    url: '/api/v1/settings/' + params.name,
	    type: 'PUT',
	    data: JSON.stringify({'val': params.value}),
	    contentType: 'application/json; charset=utf-8',
	    success: function($return_data) {
		if($return_data.error)
		    alert($return_data.error);
	    }
	});
	return false;
    },
    editUser: function(params){
	console.log(params);
    }
}