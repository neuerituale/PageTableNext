<?php

namespace ProcessWire;

/**
 * @global Page $page
 * @global PageArray $value
 * @global Field $field
 * @global Pages $pages
 * @global Config $config
 */

if(!($value instanceof PageArray)) return;

// prepare path to template files
$path = $field->pathToTemplates ? (trim($field->pathToTemplates, '/') . '/') : '';

// render content elements
foreach($value as $contentElement) echo $page->renderValue($contentElement, $path.$contentElement->template->name);