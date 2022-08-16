<?php

/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2022 Neue Rituale GbR
 * @author NR <code@neuerituale.com>
 * @license MIT
 */

namespace ProcessWire;

class PageTableNextConfig extends ModuleConfig
{

	/**
	 * @return array
	 * @throws WireException
	 */
	public function getDefaults() {
		return [];
	}


	/**
	 * @return InputfieldWrapper
	 * @throws WireException
	 * @throws WirePermissionException
	 * @throws \Exception
	 */
	public function getInputfields() : InputfieldWrapper {

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

		$fieldset = $this->modules->get('InputfieldFieldset');
		$fieldset->label = $this->_('Setup field and template');
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
			//'wrapClass' => 'uk-background-muted',
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
			'value' => $this->_('Setup field'),
			'secondary' => true,
		]);

		return $inputfields;
	}
}