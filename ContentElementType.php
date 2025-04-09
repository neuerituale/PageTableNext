<?php

/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2025 Neue Rituale GbR
 * @author NR <code@neuerituale.com>
 * @license MIT
 */

namespace ProcessWire;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use ProcessWire\GraphQL\Cache;
use ProcessWire\GraphQL\Type\PageType;

class ContentElementType
{
	public static string $name = 'ContentElement';
	public static string $description = 'Content Element Page in PageTable';

	public static function type() {
		return Cache::type(self::$name, function() {
			return new ObjectType([
				'name' => self::$name,
				'description' => self::$description,
				'fields' => array_merge(PageType::getLegalBuiltInFields(), [

					'title' => [
						'type' => Type::string(),
						'description' => "Content element title",
					],

					'type' => [
						'type' => Type::string(),
						'description' => "Content element type (template name)",
						'resolve' => function($value) {
							return wire()->sanitizer->pascalCase($value->template->name);
						}
					],

					'render' => [
						'type' => Type::string(),
						'description' => "The rendered section",
						'resolve' => function(Page $value) {

							// find field settings
							$field = $value['_pageTableField'] ? wire()->fields($value['_pageTableField']) : null;
							$path = $field->pathToTemplates
								? (trim($field->pathToTemplates, '/') . '/')
								: ''
							;

							// find template file
							$graphQlFile = $value->template->name . '.graphql';
							$templateFile = is_file(wire()->config->paths->fieldTemplates . $path . $graphQlFile . '.php')
								? $graphQlFile
								: $value->template->name
								;

							// render and reduce whitespace
							$out = $value->renderValue($value, $path.$templateFile);
							if(is_object($out) && method_exists($out, '__toString')) $out = (string) $out;
							elseif(!is_string($out)) $out = json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

							return wire()->sanitizer->reduceWhitespace($out);
						}
					]

				])
			]);
		});
	}
}