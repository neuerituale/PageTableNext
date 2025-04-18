# PageTableNext

## What it does
This module is a solid base for the implementation of custom builder systems and modular template systems. It provides a list of PageTable based content elements and adds an intuitive UI to the ProcessWire backend to make content creation and editing as simple and fun as possible. It offers functions to create, publish, move, delete, hide, copy and paste content elements.

The rendering logic of the module is detached from the ProcessWire backend scope via Shadow DOM and allows for custom rendering and styling of the elements in the backend, so the backend preview can look identical to the front end, or anything like you can imagine. It ships with some helper functions that simplify the handling
of content elements.

The module extends Ryan's PageTable and is strongly inspired by
[PageTableExtended](https://processwire.com/modules/author/mademyday/) by mademyday.
Big thanks to both of them.

## Features
- Custom rendering (e.g. frontend preview) in the backend. Content elements are encapsulated in Shadow DOM.
- Instant publishing and unpublishing.
- Copy and paste with check of allowed templates (page-wide).
- Editing in the ProcessWire modal.
- Instant deletion of content elements.
- Custom JavaScript actions can be easily added.
- Page references support.
- Triggers save on all referenced pages (e.g. clear cache).
- Shows the "view" link in the edit view that leads to the referenced page ```/link/to/parent/#s[PageId]```.
- Manipulates the breadcrumb navigation of the content element (Shows the first referenced page).
- Support for [ProcessGraphQL](https://processwire.com/modules/process-graph-ql/) with the additional modules *GraphQLFieldtypePageTable* and *GraphQLFieldtypePageTableNext*

## Install (Short way)
1. Copy the files for this module to ```/site/modules/PageTableNext/``` and Install PageTableNext, FieldtypePageTableNext and InputfieldPageTableNext.
2. Enter your favorite field name and click "Setup Field" in Module Configuration.
3. Add the field to your page template and add some content element templates to the PageTableNext field.

## Install (Long way)
1. Copy the files for this module to ```/site/modules/PageTableNext/``` and Install PageTableNext, FieldtypePageTableNext and InputfieldPageTableNext.
2. Create a new template (e.g. "content-elements").
    - In the tab "Access" set the permission management to "Yes", then check "View page" and "Guest".
    - Optional: In the tab "Family" set the option "Can this template be used for new pages?" to "One".
    - Optional: In the "Advanced" tab, check the options "Don't allow pages to change their template?" and "Don't allow unpublished pages".
3. Create a new page which will act as a container for the content elements (as child of Admin) with the title e.g. "Content Elements". Choose the template from step 2 ("content-elements")
4. Create a new field of type PageTableNext (e.g. ptn)
    - "Details" tab
        - Select one or more templates for your content elements under "Select one or more templates for items".
        - Optional: In "Select a parent for items" select the container page you created in step 3.
        - Optional: Configure the following at "Page behaviors":
            - Delete: Delete them
            - Trash: Nothing
            - Unpublish: Nothing
    - "Input" tab
        - Optional: For "Automatic Page Name Format" add ```{template.label|template.name}```.
        - Path to content element templates: Add the path for the front- and backend rendering of the content elements. The path is relative to /site/templates/fields/ e.g. "ptn/". The name of the PHP template file must match the name of the template.
5. Copy the file from the module folder ```/site/modules/PageTableNext/data/ptn.php``` to the folder ```/site/templates/fields/[fieldname].php```. Replace "ptn" with your field name
6. Add the field to your page template and add some content element templates to the new PageTableNext field.

## Install via composer
1. Execute the following command in your website root directory.
   ```bash
   composer require nr/pagetablenext

## Rendering

### Frontend
Use file field rendering for the output. You can find
[more information here](https://processwire.com/blog/posts/more-repeaters-repeater-matrix-and-new-field-rendering/#processwire-3.0.5-introduces-field-rendering-with-template-files).
```php
// if your field name is "ptn":
echo $page->render->ptn;
```

### Backend
All elements are rendered in the backend as custom HTML elements (&lt;ptn-content&gt;). The styling is separated from the backend.
This way, the rendering of your content elements is encapsulated and separated from the backend.
You can use a different custom element
[by extending the class "PtnContent"](#override_custom_element).
````js
class PtnContent extends HTMLElement {
	constructor() { /* some code here*/ }
}

customElements.define('ptn-content', PtnContent);
````

## Configuration / Add news fields
`Modules` > `Configure` > `PageTableNext`

### Field settings
`Fields` > `ptn` > `Details`

#### Select one or more templates for items
Here you can select templates for the content elements. These templates are available later
when you want to create new content elements on your page.

#### Select a parent for items
If selected, all new content elements are stored as a child page of the selected page. If no page is selected,
the content elements will be created as child pages of the referenced page.

![Fieldsettings](https://user-images.githubusercontent.com/11630948/184857397-60cd86c1-1af9-4207-aa0e-18b0ffcc85eb.png)

## API
The field itself returns a PageArray of content elements. If you want you can create your own rendering:

```php
/** @var PageArray $contentElements */
$contentElements = $page->ptn;
$renderIndex = 0;

/** @var Page $contentElement */
foreach($contentElements as $contentElement) {
    echo $page->renderValue(
        $contentElement->set('_myRenderIndex', $renderIndex++),
        'ptn/' . $contentElement->template->name
    );
}
```

## Customize/override output files
All files in the ```/site/modules/PageTableNext/templates/``` folder can be overwritten.
Just create a folder in your templates directory ```/site/templates/PageTableNext```
and copy the corresponding files there. Now you can edit the files.

### Styling
#### Variant 1:
Copy your CSS style file into the folder ```/site/templates/PageTableNext/content.css```
or set a symlink to your style file.

```shell
cd site/templates/PageTableNext/
ln -s path/to/your/style.css content.css
```

#### Variant 2:
Copy the file ```/site/modules/PageTableNext/templates/ptn-content.php```
into the directory ```/site/templates/PageTableNext/``` and change the path to your
style files below

### <a name="override_custom_element"></a>Extend Custom Element
If you want to execute your own code while creating the content elements,
e.g. initialize the page tree with Alpine, you can extend the CustomElement.
You can add your own code to the ```ptn.php``` file for example

#### First Step
```js
class MyContent extends PtnContent {
	constructor() {
		super();

		// Add alpine init to the custom element
		document.addEventListener('alpine:init', () => {
			Alpine.initTree(this.shadowRoot);
			setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 400)
		}, { once: true})
	}
}

// Define new custom element
if(!customElements.get('my-content')) {
	customElements.define('my-content', MyContent);
}
```
#### Second Step
Override ```ptn-content.php```. Go to the bottom of the file and change the
tag name from ```<ptn-content>``` to ```<my-content>```

```php
//...
<my-content>
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
</my-content>
```

### Add custom actions
In order to add new JavaScript actions, follow the two steps.
Add a button to the list of actions in the file ```ptn-content```.

```html
<a
		class="uk-icon-button uk-icon ptn_actions_custom"
		data-actioncustom='{"name": "myaction", "params": "your method input"}'
		href="#"
		uk-icon="icon: bolt; ratio: .8"
		title="<?= __('My Custom Action'); ?>"
></a>
```

Register your action e.g. in the file ```ptn.php```.
```html
<script>
	$.InputfieldPageTableNextContentElementCustomActions.actionMyaction = function (params, event) {
		/** PointerEvent */
		const clickEvent = event;

		/** mixed (your custom parameter) */
		const myParams = params;

		/** $.InputfieldPageTableNextContentElement */
		const contentElementInstance = this;

		/** $.InputfieldPageTableNext */
		const table = this.getParent();
	}
</script>
```

## Abandoned data
Sometimes it can happen that a page loses the link to a PageTableNext field. It can then be useful to locate this abandoned content

You can use this function to find these abandoned pages.
```php
// find the abandoned page ids as array
$abandonedPageIds = $modules->get('PageTableNext')->findAbandonedPageIds();

// OR

// find the abandoned pages as PageArray and delete
$options = [
    'selector' => 'limit=25, sort=-modified, include=all', // default
    'additionalSelector' => 'modified<now-24month', // example
    'finderOptions' => ['lazy' => true] // default
];
$abandonedPages = $modules->get('PageTableNext')->findAbandonedPages($options);
foreach($abandonedPages as $p) wire()->pages->delete($p);

```

## GraphQL
The content elements can also be queried using GraphQL. 
For this purpose, the data is divided into three new fields: 
`id`, `type` and `render`. All other page fields are still available (created, name, references, template ...).

`id` is the page id of the content element.
`type` is the template name in PascalCase.  
`render` is everything from the content element template file `/site/fields/[content-element-template-name].php`. 
This template is also used for the preview in the backend. 
If you want to use a different template here, e.g. to return different fields or a serialised object, 
you can create an additional template file with the postfix ".graphql" `/site/fields/[content-element-template-name].graphql.php`.

### Request
```graphql
query {
    home {
        first {
            id
            name
            title
            ptn {
                getTotal
                list {
                    id
                    type
                    render
                }
            }
        }
    }
}
```
### Response
```json
{
  "data": {
    "home": {
      "first": {
        "id": "1",
        "name": "home",
        "title": "Home",
        "ptn": {
          "getTotal": 2,
          "list": [
            {
              "id": "1193",
              "type": "CeText",
              "template": "ce-text",
              "render": "<h1>Hello World</h1>"
            },
            {
              "id": "1194",
              "type": "CeImage",
              "template": "ce-image",
              "render": "<h1>Nice pictures</h1> <img ....>"
            }
          ]
        }
      }
    }
  }
}
```

![GraphQL](https://user-images.githubusercontent.com/11630948/246352654-886dc0ba-4c84-4f0b-a923-bc5b08849f79.png)
*GraphQL query with Postman*

## ToDos
- Refactor content element handling with Alpine.js
- Video-Tutorial