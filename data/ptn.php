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
foreach($value as $contentElement) echo $page->renderValue($contentElement, ($field->pathToTemplates ?? '') . $contentElement->template->name);