
class PtnContent extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: 'open' });
		setTimeout(() => {
			const template = this.querySelector('#content');
			shadow.append(template.content);
		})
	}
}

// custom element
// move content to shadow-dom
customElements.define('ptn-content', PtnContent);

/**
 * InputfieldPageTableNext
 */
(function($, window, document, undefined) {
	'use strict';

	/**
	 * InputfieldPageTableNext
	 */
	$.InputfieldPageTableNext = function(el, options) {

		const self = this;

		const defaults = {
			containerSelector: '.InputfieldPageTableContainer',
			tableSelector: '.InputfieldPageTableContainer table',

			actionAddSelector: '.InputfieldPageTableAdd',
			contentElementSelector: 'table tr',
			actionUnpubSelector: '.ptn_actions_unpub',
			actionEditSelector: '.ptn_actions_edit',
			actionDeleteSelector: '.ptn_actions_delete',
			actionCopySelector: '.ptn_actions_copy',
			actionUncopySelector: '.ptn_actions_uncopy',
			actionInsertSelector: '.ptn_actions_insert',
			actionCustomSelector: '.ptn_actions_custom',
			actionToggleCollapseSelector: '.ptn_meta',
			emptymessageSelector: '.ptn_emptymessage',

			containerUrl: '',
			sortFieldSelector: '.InputfieldPageTableSort',

			// events
			create: function(){},
			open: function(){}

		};

		self.options = $.extend({}, defaults, options);
		self.$context = $(el);

		const helper = {

			/**
			 * Is Object
			 * @param item
			 * @returns {boolean}
			 */
			isObject: function (item) { return (item && typeof item === 'object' && !Array.isArray(item)); },

			/**
			 * Is Function
			 * @param obj
			 * @returns {boolean}
			 */
			isFunction: function(obj) { return typeof obj === 'function' || false; },

			/**
			 * Test content element
			 * @param ce
			 * @returns {boolean}
			 */
			isContentElement: function(ce) {
				return (ce instanceof $.InputfieldPageTableNextContentElement) && ce.id > 0;
			},

			/**
			 * Capitalize string
			 * @param str
			 * @returns {string}
			 */
			ucFirst: function(str){ return str.charAt(0).toUpperCase() + str.slice(1)},

			/**
			 * Find content element instance by event
			 * @param e
			 * @returns {$.InputfieldPageTableNextContentElement|null}
			 */
			getCEInstanceByEvent: function(e) {
				const $contentElementContext = $(e.currentTarget).closest(self.options.contentElementSelector)
				return this.getCEInstanceByElement($contentElementContext);
			},

			/**
			 * Get instance from element
			 * @param el
			 * @returns {$.InputfieldPageTableNextContentElement|jQuery|null}
			 */
			getCEInstanceByElement(el) {
				const instance = $(el).data('inputfieldPageTableNextContentElement');
				return instance && helper.isObject(instance) ? instance : null;
			},

			/**
			 * Copy buttons to iFrame context
			 * @param $frame
			 * @param selector
			 */
			copyButtonsToIframeContext: function($frame, selector = '[type=submit]') {
				const buttons = [];

				$frame.contents().find(selector).each(function() {

					const $button = $(this);
					const text = $button.text();
					let skip = false;

					// avoid duplicate buttons
					for(let i = 0; i < buttons.length; i++) {
						if(buttons[i].text === text || text.length < 1) skip = true;
					}

					// add to buttons array
					if(!skip) buttons.push({
						'text': text,
						'class': ($button.is('.ui-priority-secondary') ? 'ui-priority-secondary' : ''),
						'click': function() {
							if($frame.closeOnSave) $frame.closeOnSaveReady = true
							$frame.closeOnSave = true
							$button.click();
						}
					});

					// hide original button
					$button.hide();

				});

				$frame.setButtons(buttons);
			},

			/**
			 * Add inputfieldPageTableNextContentElement to clipboard or clear
			 * @param value
			 * @param parent
			 */
			clipboard: function(value = null) {

				// clear clipboard
				sessionStorage.removeItem('ptn_clipboard_id');
				sessionStorage.removeItem('ptn_clipboard_preview');
				sessionStorage.removeItem('ptn_clipboard_template');

				if(value && helper.isContentElement(value)) {
					// save in session storage
					sessionStorage.setItem('ptn_clipboard_id', value.id);
					sessionStorage.setItem('ptn_clipboard_preview', this.getPreviewHTML(value));
					sessionStorage.setItem('ptn_clipboard_template', value.template);
				}

				$(document).trigger('update.ptn');

			},

			/**
			 * Build preview instance
			 * @param instance
			 * @param parent
			 * @returns {string}
			 */
			getPreviewHTML: function(instance) {

				const $preview = instance.$context.clone(false);
				const parent = instance.getParent();

				// insert in dom for correct display values ('inline-flex' on $.show())
				parent.$table.find('tbody').append($preview);

				$preview.attr('data-id', 0);
				$preview.attr('data-template', 0);

				$preview.attr('data-viewable', false);
				$preview.attr('data-publishable', false);
				$preview.attr('data-isUnpublished', true);
				$preview.attr('data-editable', false);
				$preview.attr('data-deletable', false);
				$preview.attr('data-copyable', false);
				$preview.attr('data-uncopyable', true);
				$preview.attr('data-insertable', true);

				$preview.attr('data-unpuburl', '');
				$preview.attr('data-deleteurl', '');
				$preview.attr('data-isCopy', true); // mark as copy
				//previewInstance.$context.find('.ptn_label').append(' (copy)');

				// init and prepare instance
				$preview.inputfieldPageTableNextContentElement({parent: parent});
				const previewInstance = $preview.data('inputfieldPageTableNextContentElement')

				// remove collapsable area
				previewInstance.$context.find(instance.options.collapseSelector).remove();
				$preview.remove();

				return previewInstance.$context[0].outerHTML;
			}
		};

		/**
		 * Init content elements
		 * @returns {jQuery.InputfieldPageTableNext}
		 */
		self.initContentElements = function() {
			self.$context
				.find(self.options.contentElementSelector)
				.inputfieldPageTableNextContentElement({parent: self})
			;
			return self;
		};

		/**
		 * @returns {jQuery.InputfieldPageTableNext}
		 */
		self.initSortable = function() {

			self.$table.find('tbody').sortable({

				axis: 'y',

				start: function(event, ui) {
					// collapse while sorting
					const contentElementInstance = helper.getCEInstanceByElement(ui.item.context);
					if(helper.isObject(contentElementInstance) && !contentElementInstance.collapsed) {
						contentElementInstance._uncollapseOnStop = true;
						contentElementInstance.collapsed = true;
						contentElementInstance.update(true);
					}
				},

				stop: function(event, ui) {
					// uncollapse on stop sorting
					const contentElementInstance = helper.getCEInstanceByElement(ui.item.context);
					if(helper.isObject(contentElementInstance) && contentElementInstance._uncollapseOnStop) {
						delete contentElementInstance._uncollapseOnStop;
						contentElementInstance.collapsed = false;
						contentElementInstance.update(true);
					}
				},

				update: function(e, ui) {
					self.$table.closest('.Inputfield').trigger('sorted', [ ui.item ]);
					self.updateSorting();
				}
			});

			return self;
		}

		/**
		 * Update allowed template ids
		 * @returns {jQuery.InputfieldPageTableNext}
		 */
		self.initAllowedTemplates = function() {
			self.allowedTemplates = [];
			self.$context.find(self.options.actionAddSelector).each(function(index, el) {
				const url = new URL(el.dataset.url, window.location.origin);
				if(url.searchParams.has('template_id'))
					self.allowedTemplates.push( parseInt(url.searchParams.get('template_id')) )
			});
			return self;
		};

		/**
		 * Update sorting field
		 * @returns {jQuery.InputfieldPageTableNext}
		 */
		self.updateSorting = function() {
			const ids = self.getContentElements({ onlyIds: true, includeDeleted: true, includeCopies: true })
			self.$sortField.val(ids.join('|'));
			return self;
		}

		/**
		 * Get all instances of content elements
		 * @returns {*[]}
		 */
		self.getContentElements = function(options = {}) {

			const defaults = {
				includeDeleted: false,
				includeCopies: false,
				onlyIds: false,
			};

			options = $.extend({}, defaults, options);

			let instances = [];
			self.$context.find(self.options.contentElementSelector).each(function(index, el) {
				const instance = helper.getCEInstanceByElement(el);

				// skip invalid
				if(!helper.isObject(instance)) return;

				// skip copies
				if(!options.includeCopies && !instance.id) return;

				// skip deleted if configured
				if(instance.options.isDeleted && !options.includeDeleted) return;
				instances.push(instance);
			});

			// Only ids
			if(options.onlyIds) {
				instances = instances.map(function(item) { return item.id; })
			}

			return instances;
		};

		/**
		 * Handle actions
		 * @param e
		 * @param action
		 * @param params
		 * @returns {Promise<never>|*}
		 */
		self.handleAction = function(e, action, params = undefined){

			e.preventDefault();
			e.stopPropagation();

			const contentElementInstance = helper.getCEInstanceByEvent(e);
			const actionName = helper.ucFirst(action);

			if(contentElementInstance && helper.isFunction(contentElementInstance['action' + actionName])) {
				return contentElementInstance['action' + actionName].call(self, params, e);
			} else {
				console.info('ContentElementInstance has no action with name: "action' + actionName + '"')
				return Promise.reject();
			}
		};

		/**
		 * Call custom action
		 * register first in $.InputfieldPageTableNextContentElementCustomActions.actionMyaction = function(e, params) {}
		 * @param e
		 * @returns {Promise<never>|*}
		 */
		self.handleCustomAction = function(e) {

			const data = $(e.currentTarget).data('actioncustom');
			const customActions = $.InputfieldPageTableNextContentElementCustomActions;

			// action name not exists
			if(!data.name) {
				console.info('Missing name property in "data-actioncustom".');
				return Promise.reject();
			}

			const actionName = 'action' + helper.ucFirst(data.name);
			if(customActions.hasOwnProperty(actionName) && helper.isFunction(customActions[actionName])) {

				// prevents
				if(data?.prevents ?? true) {
					e.preventDefault();
					e.stopPropagation();
				}

				// call
				return customActions[actionName].call(
					helper.getCEInstanceByEvent(e),
					data?.params ?? undefined,
					e
				);
			} else {
				console.info('Missing action "'+actionName+'" in "$.InputfieldPageTableNextContentElementCustomActions"');
				return Promise.reject();
			}

		}

		/**
		 * Add new content element
		 * @param e
		 * @returns {Promise<unknown>}
		 */
		self.handleAdd = function(e) {
			return new Promise(function(resolve, reject) {
				const url = e.currentTarget.dataset.url;

				self.dialog(url, function($iframe) {

					// add modal page id
					const url = new URL(self.options.containerUrl)
					if($iframe.modalPageId > 0) url.searchParams.append('InputfieldPageTableAdd', $iframe.modalPageId)

					self.reload(url);
					resolve();
				})
			});
		}

		/**
		 * Reload content element table
		 * update sorting
		 * @param url
		 */
		self.reload = function(url = undefined) {
			return new Promise(function(resolve, reject) {

				// Prepare url and add sorting
				if(url === undefined) url = self.options.containerUrl;
				if(!(url instanceof URL)) url = new URL(url.toString());
				const ids = self.getContentElements({ onlyIds: true, includeDeleted: true, includeCopies: true })
				if(ids.length) url.searchParams.append('InputfieldPageTableSort', ids.join(','))

				// reload
				fetch(url, {
					method: 'GET',
					headers: {
						'X-Requested-With': 'XMLHttpRequest'
					}
				})
					.then(r => r.text() )
					.then(data => {
						self.$container.html(data);

						// Update table & sortfield
						self.$table = self.$context.find(self.options.tableSelector);
						self.$sortField = self.$context.find(self.options.sortFieldSelector);
						self.$emptymessage = self.$context.find(self.options.emptymessageSelector);

						self.$container.find(".Inputfield").trigger('reloaded', ['InputfieldPageTable']);
						self.initContentElements().initSortable().update();
						resolve();
					})
					.catch(function(e) { reject(e); })
				;

			});
		};

		/**
		 * Update table
		 * Show/hide copied preview
		 */
		self.update = function() {

			// remove copied preview
			self.$table.find('tbody [data-isCopy]').remove();

			// show/hide copied preview
			const copiedId = parseInt( sessionStorage.getItem('ptn_clipboard_id') );
			const templateId = parseInt( sessionStorage.getItem('ptn_clipboard_template') );
			if(copiedId > 0 && self.allowedTemplates.includes(templateId)) {

				// show preview
				const $preview = $( sessionStorage.getItem('ptn_clipboard_preview') );
				self.$table.find('tbody').append($preview);
				$preview.inputfieldPageTableNextContentElement({ parent: self })

			}

			// show hide empty message
			const instances = self.getContentElements();
			self.$emptymessage.toggle(!instances.length);

			// update instances
			instances.forEach(function(instance) { instance.update() });

		};

		/**
		 * Init the Program
		 */
		self.init = function() {

			self.$container = self.$context.find(self.options.containerSelector);
			self.options.containerUrl = self.$container[0].dataset.url;
			self.fieldname = self.$container[0].dataset.fieldname;
			self.$table = self.$context.find(self.options.tableSelector);
			self.$sortField = self.$context.find(self.options.sortFieldSelector);
			self.$emptymessage = self.$context.find(self.options.emptymessageSelector);
			self.allowedTemplates = [];

			self.initContentElements().initSortable().initAllowedTemplates();

			self.$context.on('click', self.options.actionAddSelector, function(e){ return self.handleAdd(e) } );
			self.$context.on('click', self.options.actionUnpubSelector, function(e){ return self.handleAction(e,'unpub')} );
			self.$context.on('click', self.options.actionEditSelector, function(e){ return self.handleAction(e,'edit')} );
			self.$context.on('click', self.options.actionDeleteSelector, function(e){ return self.handleAction(e,'delete')} );

			self.$context.on('click', self.options.actionToggleCollapseSelector, function(e){ return self.handleAction(e,'toggleCollapse')} );
			self.$context.on('click', self.options.actionCopySelector, function(e){ return self.handleAction(e, 'copy')} );
			self.$context.on('click', self.options.actionUncopySelector, function(e){ return self.handleAction(e, 'uncopy')} );
			self.$context.on('click', self.options.actionInsertSelector, function(e){ return self.handleAction(e, 'insert')} );
			self.$context.on('click', self.options.actionCustomSelector, function(e){ return self.handleCustomAction(e)} );

			$(document).on('update.ptn', function() { self.update(); })
			self.update();

			// event:create
			self.options.create.call(self);

			return self;
		};

		/**
		 * Open dialog for add or edit content elements
		 * @param url
		 * @param onClose
		 */
		self.dialog = function (url, onClose = null) {

			// iFrame
			const $iframe = pwModalWindow(
				url,
				{
					close: function () {
						if(helper.isFunction(onClose)) onClose.call(this, $iframe);
					}
				},
				'large'
			);
			$iframe.css('opacity', 0);
			$iframe.closeOnSaveReady = false;
			$iframe.modalPageId = 0;

			setTimeout(function() { $iframe.css('opacity', 1); }, 1000) // fallback
			$iframe.on('load', function() {

				const $iframeContents = $iframe.contents();

				// copy buttons and hide things we don't need in a modal context
				helper.copyButtonsToIframeContext($iframe, '#content form button.ui-button[type=submit]');
				$iframeContents.find('#wrap_Inputfield_template, #wrap_template, #wrap_parent_id').hide();
				$iframeContents.find('#breadcrumbs ul.nav, #_ProcessPageEditDelete, #_ProcessPageEditChildren').hide();

				// Close magic
				$iframe.closeOnSave = $iframeContents.find('#ProcessPageAdd').length === 0;

				// Find page id
				$iframe.modalPageId = parseInt($iframeContents.find('#Inputfield_id').val());

				// Close
				if(
					$iframe.closeOnSave &&
					$iframe.closeOnSaveReady &&
					$iframeContents.find(".NoticeError, .NoticeWarning, .ui-state-error").length === 0
				) {

					// Support for Module Notifications
					if(typeof Notifications != "undefined") {

						const messages = [];
						$iframeContents.find(".NoticeMessage").each(function() {
							messages[messages.length] = $(this).text();
						});

						if(messages.length > 0) setTimeout(function() {
							for(var i = 0; i < messages.length; i++) Notifications.message(messages[i]);
						}, 500);
					}

					// close dialog
					$iframe.dialog('close');

					return;
				}

				// show content
				$iframe.css('opacity', 1);
			});
		}

		/**
		 * Get Helper
		 * @returns {{isObject: (function(*)), copyButtonsToIframeContext: helper.copyButtonsToIframeContext, isFunction: (function(*)), isContentElement: (function(*)), ucFirst: (function(*)), getPreviewHTML: (function(*): string), getCEInstanceByEvent: (function(*): jQuery.InputfieldPageTableNextContentElement|jQuery|null), clipboard: helper.clipboard, getCEInstanceByElement(*): (jQuery.InputfieldPageTableNextContentElement|jQuery|null)}}
		 */
		self.getHelper = function() { return helper };

		// run
		self.init();
	};

	/**
	 * Custom Actions
	 * @type {{}}
	 */
	$.InputfieldPageTableNextCustomAction = {};

	/**
	 * Extend jQuery
	 * @param options
	 * @returns {*}
	 */
	$.fn.inputfieldPageTableNext = function(options) {

		// each element
		return this.each(function() {
			if(undefined == $(this).data('inputfieldPageTableNext')) {
				$(this).data('inputfieldPageTableNext', new $.InputfieldPageTableNext(this, options));
			}
		});

	};

}(jQuery, window, window.document));

/**
 * InputfieldPageTableNextContentElement
 */
(function($, window, document, undefined) {
	'use strict';

	/**
	 * InputfieldPageTableNext
	 */
	$.InputfieldPageTableNextContentElement = function(el, options) {

		const self = this;
		const parent = options.parent;
		const helper = {

			/**
			 * Build query data with token
			 * @param data
			 * @returns {*}
			 */
			buildQueryData: function (data = {}) {
				const post_token = $('._post_token').first();
				const token_name = post_token.attr('name');
				const token_value = post_token.attr('value');

				data = $.extend({}, data);
				data[token_name] = token_value
				return data;
			},

			/**
			 * Get storage key for persisting collapse state
			 * @returns {string}
			 */
			collapseStorageKey: function() {
				return 'ptn_collapsed_' + self.id
			},
		};

		const defaults = {

			collapseSelector: '.ptn_collapse',

			isLoading: false,
			viewable: false,
			publishable: false,
			editable: false,
			deletable: false,

			copyable: false,
			insertable: false,
			uncopyable: false,

			isUnpublished: false,
			//isHidden: false,
			isDeleted: false,
			//isTrash: false,

			unpubUrl: '',
			deleteConfirm: '',
		};

		self.options = $.extend({}, defaults, options);
		self.$context = $(el);
		self.id = 0;
		self.collapsed = true;

		/**
		 * Unpub a content element
		 * @param status
		 * @returns {Promise<unknown>|Promise<void>}
		 */
		self.actionUnpub = function(status) {

			if(status === self.options.isUnpublished || !self.options.publishable) return Promise.reject();
			if(status === undefined) status = !self.options.isUnpublished;

			const data = helper.buildQueryData({
				action: status ? 'unpub' : 'pub',
				id: self.id
			});

			self.loading = true;
			return fetch(self.options.unpubUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
					'X-Requested-With': 'XMLHttpRequest'
				},
				body: new URLSearchParams(data)
			})
				.then(r => r.json() )
				.then(j => {
					if(j.success) self.options.isUnpublished = j.action === 'unpub';
				})
				.finally(() => {
					self.loading = false;
					self.update();
				})
		}

		/**
		 * Edit content element
		 * @returns {Promise<void>}
		 */
		self.actionEdit = function () {
			return new Promise(function(resolve, reject) {

				if(!self.options.editable) return reject();

				parent.dialog(self.options.editUrl, function() {
					parent.reload();
					resolve();
				});

			});
		}

		/**
		 * Delete content element
		 * @param confirm
		 * @returns {Promise<unknown>}
		 */
		self.actionDelete = function (confirm = true) {

			return new Promise(function (resolve, reject) {
				if(!self.options.deletable) return reject();
				if(confirm) ProcessWire.confirm(self.options.deleteConfirm, resolve, reject);
				else resolve();
			})
				.then(function() {

					const data = helper.buildQueryData({
						id: self.id,
						action: 'trash'
					});

					self.loading = true;
					return fetch(self.options.deleteUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
							'X-Requested-With': 'XMLHttpRequest'
						},
						body: new URLSearchParams(data)
					})
						.then(r => r.json() )
						.then(json => {

							if(json.success && json.remove) {

								// uncopy deleted elements
								const copyId = parseInt(sessionStorage.getItem('ptn_clipboard_id'));
								if(copyId === self.id) parent.handleUncopy(self);

								// delete
								self.options.isDeleted = true;
							}

						})
						.finally(() => {
							self.loading = false;
							self.update();
							parent.update();
						})

				})
				.catch(function() { /**/ })
				;
		}

		/**
		 * Copy content element
		 * @returns {Promise<unknown>}
		 */
		self.actionCopy = function () {
			return new Promise(function(resolve, reject) {
				if(!self.options.copyable) return reject();
				parent.getHelper().clipboard(self, parent);
				resolve();
			})
		}

		/**
		 * Abort copy content element
		 * @returns {Promise<unknown>}
		 */
		self.actionUncopy = function () {
			return new Promise(function(resolve, reject) {
				if(!self.options.uncopyable) return reject;
				parent.getHelper().clipboard(null);
				resolve();
			})
		}

		/**
		 * Insert element
		 * @returns {Promise<unknown>}
		 */
		self.actionInsert = function() {
			return new Promise(function(resolve, reject) {

				if(!self.options.insertable) return reject();

				const copyId = parseInt(sessionStorage.getItem('ptn_clipboard_id'));
				const data = helper.buildQueryData({
					action: 'clone',
					id: copyId,
					sort: 1,
				});

				self.loading = true;
				return fetch(self.options.insertUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
						'X-Requested-With': 'XMLHttpRequest'
					},
					body: new URLSearchParams(data)
				})
					.then(response => response.json() )
					.then(json => {

						if(json.success && json.page > 0) {

							// set id and reload content while adding to field
							self.id = json.page;

							const url = new URL(parent.options.containerUrl)
							if(self.id > 0) url.searchParams.append('InputfieldPageTableAdd', self.id)

							// reload and clear clipboard
							parent
								.reload(url)
								.then(function() { parent.getHelper().clipboard(null); })
							;

							resolve();
						}

					})
					.finally(() => {
						self.loading = false;
					})
			});
		};

		/**
		 * Uncollapse content element
		 * @returns {jQuery.InputfieldPageTableNextContentElement}
		 */
		self.actionUncollapse = function(){ return self.actionToggleCollapse(false); };

		/**
		 * Collapse content element
		 * @returns {jQuery.InputfieldPageTableNextContentElement}
		 */
		self.actionCollapse = function(){ return self.actionToggleCollapse(true); };

		/**
		 * Toggle collapse
		 * @param force
		 * @returns {jQuery.InputfieldPageTableNextContentElement}
		 */
		self.actionToggleCollapse = function(force = undefined) {

			if(typeof force === 'boolean') self.collapsed = force;
			else self.collapsed = !self.collapsed;

			// persist
			sessionStorage.setItem(helper.collapseStorageKey(), self.collapsed);
			if(!self.collapsed) setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 200)

			self.update();
			return self;
		};

		/**
		 * Update content element ui
		 */
		self.update = function(immediately = false) {

			// Update copy state
			if(self.id > 0) {
				const copyId = parseInt(sessionStorage.getItem('ptn_clipboard_id'))
				self.options.copyable = copyId !== self.id;
				self.options.uncopyable = copyId === self.id;
			}

			// publish
			const $actionUnpupEl = self.$context.find(parent.options.actionUnpubSelector);
			$actionUnpupEl.toggle(self.options.publishable);
			$actionUnpupEl.find('i').toggleClass('fa-toggle-on', !self.options.isUnpublished)
				.toggleClass('fa-toggle-off', self.options.isUnpublished)
			;
			self.$context.attr('data-publishable', self.options.publishable);

			// Edit
			self.$context.find(parent.options.actionEditSelector).toggle(self.options.editable);
			self.$context.attr('data-editable', self.options.editable);

			// Delete
			self.$context.find(parent.options.actionDeleteSelector).toggle(self.options.deletable);
			if(self.options.isDeleted) self.$context.slideUp(immediately ? 0 : 'fast');
			self.$context.attr('data-deletable', self.options.deletable);

			// Collapse
			const $collapseIcons = self.$context.find('.ptn_label_icon');
			if(self.collapsed) {
				self.$collapse.slideUp(immediately ? 0 : 180);
				if($collapseIcons[0]) $($collapseIcons[0]).show();
				if($collapseIcons[1]) $($collapseIcons[1]).hide();
			} else {
				self.$collapse.slideDown(immediately ? 0 : 180);
				if($collapseIcons[0]) $($collapseIcons[0]).hide();
				if($collapseIcons[1]) $($collapseIcons[1]).show();
			}

			// Copy
			self.$context.find(parent.options.actionCopySelector).toggle(self.options.copyable);
			self.$context.attr('data-copyable', self.options.copyable);

			// Uncopy
			self.$context.find(parent.options.actionUncopySelector).toggle(self.options.uncopyable);
			self.$context.attr('data-uncopyable', self.options.uncopyable);

			// Insert
			self.$context.find(parent.options.actionInsertSelector).toggle(self.options.insertable);
			self.$context.attr('data-insertable', self.options.insertable);
			self.$context.find(parent.options.actionCustomSelector).toggle(!self.options.insertable);
		}

		/**
		 * Init the Program
		 */
		self.init = function() {

			self.id = parseInt(self.$context.data('id'));
			self.template = parseInt(self.$context.data('template'));

			self.options.editable = !!self.$context.data('editable');
			self.options.viewable = !!self.$context.data('viewable');
			self.options.publishable = !!self.$context.data('publishable');
			self.options.deletable = !!self.$context.data('deletable');
			self.options.copyable = !!self.$context.data('copyable');
			self.options.insertable = !!self.$context.data('insertable');
			self.options.uncopyable = !!self.$context.data('uncopyable');

			self.options.isUnpublished = !!self.$context.data('isunpublished');
			self.options.isHidden = !!self.$context.data('ishidden');
			self.options.isTrash = !!self.$context.data('istrash');

			self.options.unpubUrl = self.$context.data('unpuburl');
			self.options.editUrl = self.$context.data('editurl');
			self.options.deleteUrl = self.$context.data('deleteurl');
			self.options.insertUrl = self.$context.data('inserturl');
			self.options.deleteConfirm = self.$context.data('deleteconfirm');

			self.$collapse = self.$context.find(self.options.collapseSelector)
			self.collapsed = sessionStorage.getItem(helper.collapseStorageKey()) !== 'false';

			self.update(true);

			return self;
		};

		self.getHelper = function() { return helper };
		self.getParent = function() { return parent };

		self.init();
	};

	/**
	 * Custom Actions
	 * @type {{}}
	 */
	$.InputfieldPageTableNextContentElementCustomActions = {};

	/**
	 * Extend jQuery
	 * @param options
	 * @returns {*}
	 */
	$.fn.inputfieldPageTableNextContentElement = function(options) {

		// each element
		return this.each(function() {
			if(undefined === $(this).data('inputfieldPageTableNextContentElement')) {
				$(this).data('inputfieldPageTableNextContentElement', new $.InputfieldPageTableNextContentElement(this, options));
			}
		});

	};

}(jQuery, window, window.document));

$(document).ready(function() {
	$('.InputfieldPageTableNext').inputfieldPageTableNext();
});