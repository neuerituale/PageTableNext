<?php

/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2025 Neue Rituale GbR
 * @author NR <code@neuerituale.com>
 * @license MIT
 */

namespace ProcessWire;

class PageTableNextConfig extends ModuleConfig
{

	/**
	 * @return array
	 */
	public function getDefaults(): array {
		return [];
	}


	/**
	 * @return InputfieldWrapper
	 * @throws WireException
	 * @throws WirePermissionException
	 * @throws \Exception
	 */
	public function getInputfields() : InputfieldWrapper {

		/** @var JqueryCore $jquery */
		$modules = wire()->modules;
		$jquery = $modules->get('JqueryCore');
		$jquery->use('iframe-resizer');

		$fielnameSanitizer = 'fieldName,filename';

		/** @var PageTableNext $pageTableNext */
		$pageTableNext = $this->modules->get(str_replace('Config', '', $this->className));
		if(!($pageTableNext instanceof PageTableNext)) throw new \Exception('Module PageTableNext not found');

		// Run
		if($this->input->post('setup_field_and_template') && $this->session->CSRF()->validate()) {
			if($this->sanitizer->validate( $this->input->post('newFieldName'), $fielnameSanitizer )) {
				$pageTableNext->setupFieldAndTemplate( $this->input->post('newFieldName') );
			} else {
				$this->error($this->_('Invalid field name, remove whitespace and special characters.'));
			}
		}

		$inputfields = parent::getInputfields();

		/** @var InputfieldFieldset $fieldset */
		$fieldset = $this->modules->get('InputfieldFieldset');
		$fieldset->label = $this->_('Add new field and template');
		$fieldset->description = $this->_("The setup creates the following: a PageTableNext field, the template for the folder page, the folder page and copies the render file for the field to the appropriate folder (usually /site/templates/fields/). If you want to use a different field name than the default, enter it in the input field. You can also use the setup to create more PageTableNext fields. The existing folder page will also be linked to this field.");
		$inputfields->add($fieldset);

		$fieldset->add([
			'type' => 'Text',
			'name' => 'newFieldName',
			'label' => $this->_('Fieldname'),
			'notes' => $this->_('Please check if the file /site/templates/fields/[fieldname].php already exists.'),
			'value' => $this->input->post('newFieldName', $fielnameSanitizer, 'ptn'),
			'collapsed' => Inputfield::collapsedNever,
			'themeBorder' => 'none',
			'headerClass' => 'uk-padding-remove-top',
			'wrapAttributes' => [
				'class' => '',
				'style' => 'background: transparent!important'
			]
		]);

		/** @var InputfieldSubmit */
		$fieldset->add([
			'type' => 'Submit',
			'name' => 'setup_field_and_template',
			'value' => $this->_('Add new field'),
			'secondary' => true,
		]);

		/** @var InputfieldMarkup $field */
		$field = $modules->get('InputfieldMarkup');
		$field->label = $this->_('Find abandoned data');
		$field->collapsed = Inputfield::collapsedYesAjax;
		$field->markupFunction = function($inputfield) use($modules) {

			/** @var PageTableNext $ptn */
			$ptn = $modules->get('PageTableNext');
			$abandonedPages = $ptn->findAbandonedPageIds();

			if(!count($abandonedPages)) {
				$label = $this->_('No abandoned pages found');
				return "<p class='description uk-margin-top'>$label</p>";
			}

			// bookmarks for Lister
			/** @var Inputfield $inputfield */
			wire()->modules->includeModule('ProcessPageLister');
			$windowMode = ProcessPageLister::windowModeBlank;

			$bookmark = array(
				'initSelector' => 'id=' . implode('|', $abandonedPages),
				'defaultSelector' => "include=all",
				'columns' => array('title', 'template', 'parent', 'modified', 'modified_users_id', 'created'),
				'toggles' => array('noButtons'),
				'viewMode' => $windowMode,
				'editMode' => $windowMode,
				'editOption' => 0,
			);
			$id = "ptn_abandoned_pages";
			$url = ProcessPageLister::addSessionBookmark($id, $bookmark) . '&modal=inline&minimal=1';
			$description = $this->_('These pages are no longer linked to a PageTableNext field.');

			return "
				<div class='description'>$description</div>
				<iframe id='PageTableNextConfigPageLister' scrolling='no' style='width:100%; border: none;' src='$url'></iframe>
				<script>$('#PageTableNextConfigPageLister').iFrameResize({ });</script>
			";
		};
		$field->icon = 'search';
		$inputfields->add($field);

		return $inputfields;
	}
}