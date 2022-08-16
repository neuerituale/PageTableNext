<?php

/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2021 Neue Rituale GbR
 * @author NR <code@neuerituale.com>
 */

namespace ProcessWire;

/**
 * @global array $value
 * @global Page $page
 * @global Config $config
 *
 */

$adminUrl = $this->wire('config')->urls->admin;
?>

	<table width="100%">
		<tbody>
			<?php if(is_array($value) && count($value)) :

				/** @var TemplateFile $row */
				foreach($value as $row) :

					/** @var Page $contentElement */
					$contentElement = $row->value;
					if($contentElement->isTrash()) continue;
					?>
					<tr
						data-id="<?= $contentElement->id; ?>"
						data-template="<?= $contentElement->template->id; ?>"
						data-editable="<?= $contentElement->editable; ?>"
						data-viewable="<?= $contentElement->viewable; ?>"
						data-publishable="<?= $contentElement->publishable; ?>"
						data-deletable="<?= $contentElement->deletable; ?>"

						data-copyable="<?= $contentElement->editable; ?>"
						data-insertable="false"
						data-uncopyable="false"

						data-isunpublished="<?= $contentElement->isUnpublished(); ?>"
						data-ishidden="<?= $contentElement->isHidden(); ?>"
						data-istrash="<?= $contentElement->isTrash(); ?>"

						data-unpuburl="<?= $adminUrl ?>page/?id=<?= $contentElement->id; ?>&render=json"
						data-editurl="./?id=<?= $contentElement->id; ?>&modal=1"
						data-deleteurl="<?= $adminUrl ?>page/?action=trash&id=<?= $contentElement->id; ?>&render=json"
						data-inserturl="<?= $adminUrl ?>page/?action=clone&id=<?= $contentElement->id; ?>&render=json"
					>
						<td><?= $row->render(); ?></td>
					</tr>
				<?php endforeach;
			endif; ?>
		</tbody>
	</table>

	<div class="uk-card uk-margin ptn_emptymessage" style="display: none">
		<div>
			<div class="uk-card-body uk-text-lead uk-text-muted uk-padding-small uk-text-center">
				<?= __('Add content...'); ?>
			</div>
		</div>
	</div>