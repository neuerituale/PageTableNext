<?php

/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2025 Neue Rituale GbR
 * @author NR <code@neuerituale.com>
 * @license MIT
 */

namespace ProcessWire;

/**
 * @global Page $value
 * @global Page $page
 * @global User $user
 * @global InputfieldPageTableNext $ptn
 *
 * @global Modules $modules
 * @global WireDateTime $datetime
 * @global Config $config
 */
$adminUrl = $this->wire('config')->urls->admin . 'page/';
$value->of(true);

/** @var PageTableNext $pageTableNext */
$pageTableNext = $modules->get('PageTableNext');

?>
<div class="ptn">
	<div class="ptn_meta uk-flex uk-flex-middle">

		<div class="ptn_label">
			<span class="ptn_label_icon" uk-icon="icon: chevron-right; ratio: 1"></span>
			<span class="ptn_label_icon" uk-icon="icon: chevron-down; ratio: 1"></span>
			<?= $pageTableNext->getContentElementTitle($value, true); ?>
			<!-- add your own code here ... -->
		</div>

		<?= $pageTableNext->getContentElementTitlePostfix($value, true); ?>

		<div class="ptn_actions uk-margin-auto-left">

			<!-- Publish -->
			<?php if($value->publishable) :
				$publishStateIcon = $value->isUnpublished() ? 'fa-toggle-off' : 'fa-toggle-on';
				?>
				<a
					class="uk-icon-button uk-icon ptn_actions_unpub"
					href="#"
					title="<?= __('Public/Unpublish'); ?>"
				>
					<i class="fa <?= $publishStateIcon; ?>"></i>
				</a>
			<?php endif;?>

			<?php if($modules->isInstalled('ProcessPageClone') && $user->hasPermission('page-clone', $value)) : ?>
				<a
					class="uk-icon-button uk-icon ptn_actions_copy"
					href="#"
					uk-icon="icon: copy; ratio: .8"
					title="<?= __('Copy'); ?>"
				></a>
				<a
					class="uk-icon-button uk-icon ptn_actions_insert"
					style="display: none"
					href="#"
					uk-icon="icon: check; ratio: .8"
					title="<?= __('Insert copy'); ?>"
				></a>
				<a
					class="uk-icon-button uk-icon ptn_actions_uncopy"
					href="#"
					uk-icon="icon: ban; ratio: .8"
					title="<?= __('Abort copy'); ?>"
				></a>
			<?php endif; ?>

			<!-- Edit -->
			<?php if($value->editable) : ?>
				<a
					class="uk-icon-button uk-icon ptn_actions_edit"
					href="#"
					uk-icon="icon: pencil; ratio: .8"
					title="<?= __('Edit'); ?>"
				></a>
			<?php endif; ?>

			<!-- Delete -->
			<?php if($value->deletable) : ?>
				<a
					class="uk-icon-button uk-icon ptn_actions_delete"
					href="#"
					uk-icon="icon: trash; ratio: .8"
					title="<?= __('Delete'); ?>"
				></a>
			<?php endif; ?>


		</div>
	</div>
	<div class="ptn_collapse" style="display: none">
		<ptn-content>
			<template id="content">
				<?php
					$cssFilePath = $ptn->getFileLocation('content.css', 'paths');
					$cssFileUrl = $ptn->getFileLocation('content.css', 'urls');
					$cssFileUrl = $cssFileUrl . '?modified=' . filemtime($cssFilePath);
					?>
				<link rel="stylesheet" href="<?= $cssFileUrl; ?>">
				<div class="backend" data-of="<?= $value->of(); ?>">
					<?= $ptn->renderValueWrapper($page, $value); ?>
				</div>
			</template>
		</ptn-content>
	</div>

</div>