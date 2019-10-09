<?php
	$start_table = microtime(true);
	global $cols, $compact;
	$compact = isset($table->settings['styling']['compact']);
	$cols = range('A', 'Z');
	array_walk($table->settings['styling'], create_function('&$item, $key', '$item .= " $key";'));
	if (!function_exists('json_encode_escape')) {
		function json_encode_escape($array) {
			return htmlspecialchars(json_encode($array), ENT_QUOTES, 'UTF-8');
		}
	}

	$header = isset($table->settings['elements']['head']);
	$footer = isset($table->settings['elements']['foot']);

	$features = isset($table->settings['features']) ? json_encode_escape(array_keys($table->settings['features'])) : json_encode(array()) ;

	global $mergedCells;
	$mergedCells = $table->meta['mergedCells'];

	if (!function_exists('makeCell')) {
		function makeCell($cell, $rowIndex, $cellIndex, $tag = 'td') {
			global $mergedCells;
			global $cols;
			global $compact;
			$output = "<$tag ";

			if (!$compact) {
				$output .= "width=\"$cell[width]\" ";
			} 
			$output .= "id=\"$cols[$cellIndex]$rowIndex\" ";
			$output .= "data-x=\"$cellIndex;\" ";
			$output .= "data-y=\"$rowIndex\" ";
			if (substr($cell['data'], 0, 1) == '=') {
				$output .= "data-formula=\"". substr($cell['data'], 1) . "\" ";
			}
			$output .= "class=\"" . implode(' ', $cell['meta']) . "\" ";
			if (isset($cell['comment'])) {
				$output .= "title=\"$cell[comment]\" ";
			}
			if (isset($cell['hidden']) && $cell['hidden'] == 1) {
				$display = false;
				$colspan = 1;
				$rowspan = 1;
				foreach ($mergedCells as $mergedCell) {
					if ($mergedCell['row'] == $rowIndex && $mergedCell['col'] == $cellIndex) {
						$display = true;
						$colspan = $mergedCell['colspan'];
						$rowspan = $mergedCell['rowspan'];
					}
				}
				if (!$display) {
					$output .= "data-hide=\"true\" ";
				}

				$output .= "data-colspan=\"$colspan\" data-rowspan=\"$rowspan\"";
			}
			return $output .= ">$cell[data]</$tag>";
		}
	}
?>
<div class="supsystic-tables-wrap">
	<table 
		class="supsystic-table <?php print implode(' ', $table->settings['styling']); ?>" 
		id="supsystic-table-<?php print $table->id; ?>" 
		data-features="<?php print $features; ?>" 
		data-lang="<?php print $table->settings['language']['file']; ?>" 
		data-override="<?php print json_encode_escape($table->settings['language']); ?>">

		<?php if (isset($table->settings['elements']['caption'])): ?>
			<caption><?php print $table->title; ?></caption>
		<?php endif; ?>
		<?php /* Datatables requred thead section declared */ ?>
		<thead>
			<tr>
				<?php 
					foreach ($table->rows[0]['cells'] as $cellIndex => $cell) {
						if ($header) {
							print makeCell($cell, 0, $cellIndex, 'th');
						} else {
							print '<th style="display:none;"></th>';
						}
					}
				?>
			</tr>
		</thead>
		<?php if ($footer): ?>
			<tfoot>
				<tr>
					<?php 
						foreach ($table->rows[0]['cells'] as $cellIndex => $cell) {
							print makeCell($cell, 0, $cellIndex, 'th');
						} 
					?>
				</tr>
			</tfoot>
		<?php endif; ?>
		<tbody
			<?php if (!$header): ?>
			class="no-header"
			<?php endif ?>
		>
			<?php foreach ($table->rows as $rowIndex => $row): ?>
				<?php if ($rowIndex == 0 && $header) continue; ?>
				<tr
					<?php if ($row['height'] && $row['height'] !== 'NaN'): ?>
						style="height: <?php print $row['height']; ?>px"
					<?php endif; ?>
				>
					<?php 
						foreach ($row['cells'] as $cellIndex => $cell) {
							print makeCell($cell, $rowIndex, $cellIndex);
						} 
					?>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
	<div 
		id="supsystic-table-<?php print $table->id; ?>-css" 
		style="display: none;">
			<?php print $table->meta['css']; ?>
	</div>
</div>
<!-- /.supsystic-tables-wrap -->

<!-- Tables Generator by Supsystic -->
<!-- Version: <?php print $environment->getConfig()->get('plugin_version') ?> -->
<!-- Generation time: <?php print (microtime(true) - $start_table) ?> -->
<!-- http://supsystic.com/ -->