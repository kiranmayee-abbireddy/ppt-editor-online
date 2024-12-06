class PresentationEditor {
    constructor() {
        this.canvas = new fabric.Canvas('slideCanvas');
        this.presentation = {
            slides: [],
            currentSlide: null,
            title: 'Presentation1',
            zoom: 100
        };
        
        // Drawing state
        this.isDrawing = false;
        this.currentTool = null;
        this.currentObject = null;
        this.startX = 0;
        this.startY = 0;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupRibbonHandlers();
        
        // Add object selection handler
        this.canvas.on('selection:created', this.handleObjectSelection.bind(this));
        this.canvas.on('selection:updated', this.handleObjectSelection.bind(this));
        this.canvas.on('selection:cleared', this.handleSelectionCleared.bind(this));
        this.canvas.on('object:modified', this.handleObjectModified.bind(this));
        
        // Add drawing event handlers
        this.canvas.on('mouse:down', this.handleMouseDown.bind(this));
        this.canvas.on('mouse:move', this.handleMouseMove.bind(this));
        this.canvas.on('mouse:up', this.handleMouseUp.bind(this));
        
        this.createNewPresentation();
        this.setupFormatControls();
        this.setupSlideControls();
        this.setupTransitions();
        this.isDragging = false;

        // Add canvas event listeners for instant thumbnail updates
        this.canvas.on({
            'object:added': this.delayedThumbnailUpdate.bind(this),
            'object:modified': this.delayedThumbnailUpdate.bind(this),
            'object:removed': this.delayedThumbnailUpdate.bind(this)
        });

        // Add predefined layouts
        this.layouts = {
            'blank': {
                name: 'Blank',
                create: () => []
            },
            'title': {
                name: 'Title Slide',
                create: () => [
                    new fabric.IText('Click to add title', {
                        left: 640,
                        top: 280,
                        fontSize: 44,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    }),
                    new fabric.IText('Click to add subtitle', {
                        left: 640,
                        top: 360,
                        fontSize: 32,
                        fontFamily: 'Arial',
                        fill: '#666666',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    })
                ]
            },
            'titleAndContent': {
                name: 'Title and Content',
                create: () => [
                    new fabric.IText('Click to add title', {
                        left: 640,
                        top: 80,
                        fontSize: 36,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    }),
                    new fabric.IText('Click to add text', {
                        left: 100,
                        top: 160,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        width: 1080
                    })
                ]
            },
            'sectionHeader': {
                name: 'Section Header',
                create: () => [
                    new fabric.IText('Click to add section title', {
                        left: 640,
                        top: 320,
                        fontSize: 54,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 1000
                    }),
                    new fabric.IText('Click to add section description', {
                        left: 640,
                        top: 400,
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#666666',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    })
                ]
            },
            'twoContent': {
                name: 'Two Content',
                create: () => [
                    new fabric.IText('Click to add title', {
                        left: 640,
                        top: 80,
                        fontSize: 36,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    }),
                    new fabric.IText('Click to add text', {
                        left: 100,
                        top: 160,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        width: 520
                    }),
                    new fabric.IText('Click to add text', {
                        left: 660,
                        top: 160,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        width: 520
                    })
                ]
            },
            'comparison': {
                name: 'Comparison',
                create: () => [
                    new fabric.IText('Click to add title', {
                        left: 640,
                        top: 80,
                        fontSize: 36,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    }),
                    new fabric.IText('Click to add text', {
                        left: 320,
                        top: 160,
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 400
                    }),
                    new fabric.IText('Click to add text', {
                        left: 960,
                        top: 160,
                        fontSize: 28,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 400
                    }),
                    new fabric.IText('Click to add text', {
                        left: 100,
                        top: 240,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        width: 520
                    }),
                    new fabric.IText('Click to add text', {
                        left: 660,
                        top: 240,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        width: 520
                    })
                ]
            },
            'titleOnly': {
                name: 'Title Only',
                create: () => [
                    new fabric.IText('Click to add title', {
                        left: 640,
                        top: 80,
                        fontSize: 36,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    })
                ]
            },
            'pictureWithCaption': {
                name: 'Picture with Caption',
                create: () => [
                    new fabric.IText('Click to add title', {
                        left: 640,
                        top: 80,
                        fontSize: 36,
                        fontFamily: 'Arial',
                        fill: '#000000',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    }),
                    new fabric.Rect({
                        left: 320,
                        top: 200,
                        width: 640,
                        height: 360,
                        fill: 'transparent',
                        stroke: '#666666',
                        strokeWidth: 2,
                        strokeDashArray: [6, 6]
                    }),
                    new fabric.IText('Click to add caption', {
                        left: 640,
                        top: 600,
                        fontSize: 24,
                        fontFamily: 'Arial',
                        fill: '#666666',
                        textAlign: 'center',
                        originX: 'center',
                        width: 800
                    })
                ]
            }
        };

        // Initialize undo/redo stacks
        this.undoStack = [];
        this.redoStack = [];
        
        // Add state change listeners
        this.canvas.on({
            'object:modified': () => this.saveState(),
            'object:added': () => this.saveState(),
            'object:removed': () => this.saveState(),
            'text:changed': () => this.saveState()  // Add this for text changes
        });

        // Save initial state
        this.saveState();
    }

    initializeCanvas() {
        // Clean up any existing canvas instances
        if (this.canvas) {
            this.canvas.dispose();
        }

        // Get or create the canvas element
        let canvasElement = document.querySelector('#slideCanvas');
        if (!canvasElement) {
            canvasElement = document.createElement('canvas');
            canvasElement.id = 'slideCanvas';
            document.querySelector('.canvas-container').appendChild(canvasElement);
        }

        // Initialize new Fabric canvas
        this.canvas = new fabric.Canvas('slideCanvas', {
            width: 1280,
            height: 720,
            backgroundColor: 'white',
            preserveObjectStacking: true,
            selection: true
        });

        // Store original dimensions
        this.originalWidth = 1280;
        this.originalHeight = 720;

        // Initial fit to container
        this.fitToContainer();

        // Add resize listener
        window.addEventListener('resize', () => {
            this.fitToContainer();
        });
    }

    fitToContainer() {
        const container = document.querySelector('.slide-editor');
        if (!container) return;
        
        // Get container dimensions with padding
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        // Calculate scale to fit container while maintaining 16:9 aspect ratio
        const scaleX = containerWidth / 1280;
        const scaleY = containerHeight / 720;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply zoom level
        const zoomLevel = this.presentation.zoom || 100;
        const totalScale = scale * (zoomLevel / 100);
        
        // Update canvas container
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            // Let flexbox handle the centering
            canvasContainer.style.transform = `scale(${totalScale})`;
        }
        
        this.canvas.requestRenderAll();
    }

    setupEventListeners() {
        // Title input
        const titleInput = document.querySelector('.title-input');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                this.presentation.title = e.target.value;
                this.updateAutoSaveStatus('Saving...');
                this.debounceAutoSave();
            });
        }

        // Zoom controls
        document.querySelectorAll('.zoom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isZoomIn = e.currentTarget.querySelector('.ph-plus-circle');
                this.handleZoom(isZoomIn ? 10 : -10);
            });
        });

        // View mode buttons
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.textContent;
                this.switchViewMode(mode);
                
                // Update button states
                document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.debounceResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentSlide();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.addNewSlide();
                        break;
                    case 'd':
                        e.preventDefault();
                        if (this.presentation.currentSlide) {
                            this.duplicateSlide(this.presentation.currentSlide);
                        }
                        break;
                    case 'delete':
                        e.preventDefault();
                        if (this.presentation.currentSlide && this.presentation.slides.length > 1) {
                            this.deleteSlide(this.presentation.currentSlide);
                        }
                        break;
                    case 'arrowup':
                        e.preventDefault();
                        this.navigateSlides('prev');
                        break;
                    case 'arrowdown':
                        e.preventDefault();
                        this.navigateSlides('next');
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo(); // Ctrl+Shift+Z for redo
                        } else {
                            this.undo(); // Ctrl+Z for undo
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo(); // Ctrl+Y for redo
                        break;
                }
            }
        });

        // Add outline view toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isOutline = e.target.textContent === 'Outline';
                this.toggleOutlineView(isOutline);
                
                // Update button states
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Add window resize handler for reading view
        window.addEventListener('resize', () => {
            if (document.getElementById('readingView')?.style.display === 'flex') {
                this.fitReadingCanvas();
            }
        });

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                // Exited fullscreen - ensure content is preserved
                this.saveCurrentSlide();
                if (this.presentation.currentSlide) {
                    this.loadSlide(this.presentation.currentSlide);
                    this.canvas.renderAll();
                }
                this.updateSlideList();
            }
        });

        // Add delete key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || (e.key === 'Backspace' && !e.target.matches('input, textarea'))) {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    this.deleteSelectedObject();
                    e.preventDefault(); // Prevent browser back navigation
                }
            }
        });
    }

    switchViewMode(mode) {
        const editor = document.querySelector('.slide-editor');
        const mainContent = document.querySelector('.main-content');
        const slideSorter = document.getElementById('slideSorter') || this.createSlideSorter();
        const readingView = document.getElementById('readingView') || this.createReadingView();
        
        // Save current state before switching
        this.saveCurrentSlide();
        
        switch(mode) {
            case 'Slide Sorter':
                editor.style.display = 'none';
                readingView.style.display = 'none';
                slideSorter.style.display = 'grid';
                this.updateSlideSorter();
                break;
            case 'Reading View':
                editor.style.display = 'none';
                slideSorter.style.display = 'none';
                readingView.style.display = 'flex';
                this.updateReadingView();
                break;
            case 'Normal':
                editor.style.display = 'flex';
                slideSorter.style.display = 'none';
                readingView.style.display = 'none';
                // Restore the slide content
                if (this.presentation.currentSlide) {
                    this.loadSlide(this.presentation.currentSlide);
                    this.canvas.renderAll();
                }
                break;
        }
        
        // Update thumbnails after mode switch
        this.updateSlideList();
    }

    createSlideSorter() {
        const sorter = document.createElement('div');
        sorter.id = 'slideSorter';
        sorter.className = 'slide-sorter';
        
        // Initialize Sortable
        new Sortable(sorter, {
            animation: 150,
            ghostClass: 'sorter-ghost',
            draggable: '.sorter-slide',
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt;
                // Update slides array
                const slide = this.presentation.slides.splice(oldIndex, 1)[0];
                this.presentation.slides.splice(newIndex, 0, slide);
                this.updateSlideList();
                this.updateSlideCount();
            }
        });
        
        return sorter;
    }

    updateSlideSorter() {
        const sorter = document.getElementById('slideSorter');
        if (!sorter) return;
        
        sorter.innerHTML = '';
        
        this.presentation.slides.forEach((slide, index) => {
            const slideEl = document.createElement('div');
            slideEl.className = 'sorter-slide';
            if (slide === this.presentation.currentSlide) {
                slideEl.classList.add('active');
            }
            
            // Add slide number
            const number = document.createElement('div');
            number.className = 'sorter-slide-number';
            number.textContent = index + 1;
            slideEl.appendChild(number);
            
            // Add thumbnail canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'sorter-thumbnail';
            slideEl.appendChild(canvas);
            
            // Generate thumbnail
            this.generateThumbnail(slide, canvas);
            
            // Add click handler
            slideEl.addEventListener('click', () => {
                this.selectSlide(slide);
                document.querySelectorAll('.sorter-slide').forEach(s => s.classList.remove('active'));
                slideEl.classList.add('active');
            });
            
            sorter.appendChild(slideEl);
        });
    }

    setupRibbonHandlers() {
        // Text formatting controls
        this.setupTextFormatting();

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                document.querySelector('.tab-btn.active')?.classList.remove('active');
                // Add active class to clicked tab
                e.currentTarget.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.ribbon-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Show the selected tab content
                const tabId = e.currentTarget.dataset.tab;
                const tabContent = document.getElementById(`${tabId}Tab`);
                if (tabContent) {
                    tabContent.style.display = 'flex';
                }
            });
        });

        // New slide button
        const newSlideBtn = document.getElementById('newSlideBtn');
        if (newSlideBtn) {
            newSlideBtn.addEventListener('click', () => this.addNewSlide());
        }

        // Text box button
        const textBoxBtn = document.getElementById('textBoxBtn');
        if (textBoxBtn) {
            textBoxBtn.addEventListener('click', () => {
                this.startShapeDrawing('text');
                this.canvas.defaultCursor = 'text';
            });
        }

        // Shape button
        const shapeBtn = document.getElementById('shapeBtn');
        if (shapeBtn) {
            shapeBtn.addEventListener('click', () => {
                const panel = document.getElementById('shapesPanel');
                if (panel) {
                    panel.classList.toggle('active');
                }
            });

            // Close panel when clicking outside
            document.addEventListener('click', (e) => {
                const shapesPanel = document.getElementById('shapesPanel');
                const shapesDropdown = e.target.closest('.shapes-dropdown');
                if (!shapesDropdown && shapesPanel) {
                    shapesPanel.classList.remove('active');
                }
            });

            // Setup shape items
            document.querySelectorAll('.shape-item').forEach(item => {
                item.addEventListener('click', () => {
                    const shape = item.dataset.shape;
                    this.startShapeDrawing(shape);
                    const panel = document.getElementById('shapesPanel');
                    if (panel) {
                        panel.classList.remove('active');
                    }
                });
            });
        }

        // Clipboard controls
        const pasteBtn = document.querySelector('.ribbon-btn:has(.ph-clipboard)');
        const cutBtn = document.querySelector('.ribbon-btn:has(.ph-scissors)');

        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => {
                if (this.clipboard) {
                    this.clipboard.clone((clonedObj) => {
                        clonedObj.set({
                            left: clonedObj.left + 10,
                            top: clonedObj.top + 10
                        });
                        this.canvas.add(clonedObj);
                        this.canvas.setActiveObject(clonedObj);
                        this.canvas.renderAll();
                    });
                }
            });
        }

        if (cutBtn) {
            cutBtn.addEventListener('click', () => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    activeObject.clone((clonedObj) => {
                        this.clipboard = clonedObj;
                        this.canvas.remove(activeObject);
                        this.canvas.renderAll();
                    });
                }
            });
        }

        // Arrange controls
        document.getElementById('arrangeBtn')?.addEventListener('click', () => {
            this.createArrangeMenu();
        });

        // Format Shape button
        const formatShapeBtn = document.getElementById('formatShapeBtn');
        if (formatShapeBtn) {
            formatShapeBtn.addEventListener('click', () => {
                const formatPanel = document.querySelector('.format-panel');
                const shapeFormatPanel = document.querySelector('.shape-format-panel');
                if (formatPanel && shapeFormatPanel) {
                    // Toggle format panel visibility
                    if (shapeFormatPanel.style.display === 'none') {
                        shapeFormatPanel.style.display = 'block';
                        formatShapeBtn.classList.add('active');
                    } else {
                        shapeFormatPanel.style.display = 'none';
                        formatShapeBtn.classList.remove('active');
                    }
                }
            });
        }

        // Shape buttons
        document.getElementById('rectangleBtn')?.addEventListener('click', () => {
            this.startShapeDrawing('rectangle');
        });

        document.getElementById('circleBtn')?.addEventListener('click', () => {
            this.startShapeDrawing('circle');
        });

        document.getElementById('lineBtn')?.addEventListener('click', () => {
            this.startShapeDrawing('line');
        });

        document.getElementById('triangleBtn')?.addEventListener('click', () => {
            this.startShapeDrawing('triangle');
        });

        document.getElementById('ellipseBtn')?.addEventListener('click', () => {
            this.startShapeDrawing('oval');
        });

        document.getElementById('arrowBtn')?.addEventListener('click', () => {
            this.startShapeDrawing('arrow');
        });

        document.getElementById('doubleArrowBtn')?.addEventListener('click', () => {
            this.startShapeDrawing('doubleArrow');
        });

        // Layout button handler
        document.getElementById('layoutBtn')?.addEventListener('click', () => {
            this.showLayoutMenu();
        });

        // Delete button handler
        document.getElementById('deleteBtn')?.addEventListener('click', () => {
            this.deleteSelectedObject();
        });

        // Add to Drawing section in ribbon - using a more reliable selector
        const drawingSection = document.querySelector('.ribbon-section:has(.shapes-dropdown)');
        if (drawingSection) {
            drawingSection.querySelector('.button-group').appendChild(deleteBtn);
        }

        // Add undo/redo button handlers
        document.getElementById('undoBtn')?.addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redoBtn')?.addEventListener('click', () => {
            this.redo();
        });
    }

    createNewPresentation() {
        this.presentation.slides = [];
        this.addNewSlide(); // Add initial slide
        this.canvas.clear(); // Clear canvas for new presentation
        this.updateSlideCount();
    }

    addNewSlide() {
        const slide = {
            id: Date.now(),
            objects: []
        };
        
        this.presentation.slides.push(slide);
        
        // Save current slide before adding new one
        this.saveCurrentSlide();
        
        this.presentation.currentSlide = slide;
        this.canvas.clear(); // Clear canvas for new slide
        this.canvas.setBackgroundColor('white', this.canvas.renderAll.bind(this.canvas));
        this.updateSlideList();
        this.updateSlideCount();
    }

    updateSlideList() {
        const container = document.getElementById('slideThumbnails');
        if (!container) return;
  
        container.innerHTML = '';
        
        this.presentation.slides.forEach((slide, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'slide-thumbnail-wrapper';
            wrapper.setAttribute('data-slide-index', index);
  
            const number = document.createElement('div');
            number.className = 'slide-number';
            number.textContent = index + 1;
  
            const thumbnail = document.createElement('div');
            thumbnail.className = 'slide-thumbnail';
            if (slide === this.presentation.currentSlide) {
                thumbnail.classList.add('active');
            }
  
            // Create thumbnail canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'thumbnail-canvas';
            thumbnail.appendChild(canvas);
  
            // Generate thumbnail preview
            this.generateThumbnail(slide, canvas);
  
            wrapper.appendChild(number);
            wrapper.appendChild(thumbnail);
            wrapper.addEventListener('click', (e) => {
                // Prevent click if we're dragging
                if (this.isDragging) return;
                this.selectSlide(slide);
            });
            container.appendChild(wrapper);
        });
  
        this.updateSlideCount();
    }

    generateThumbnail(slide, canvas) {
        // Use exact PowerPoint aspect ratio
        const THUMBNAIL_WIDTH = 200;
        const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * (9/16);
        
        // Create temporary canvas with exact dimensions
        const tempCanvas = new fabric.Canvas(canvas, {
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
            backgroundColor: 'white',
            selection: false,
            renderOnAddRemove: false
        });
        
        if (!slide.objects || !slide.objects.length) {
            tempCanvas.renderAll();
            return;
        }
        
        // Calculate scale for thumbnail
        const scale = THUMBNAIL_WIDTH / 1280;
        tempCanvas.setZoom(scale);
        
        // Load and clone all objects
        return new Promise((resolve) => {
            fabric.util.enlivenObjects(slide.objects, (objects) => {
                objects.forEach(obj => {
                    let clone;
                    
                    if (obj.type === 'group') {
                        // Special handling for arrows (grouped objects)
                        const subObjects = obj.objects || [];
                        const clonedSubObjects = subObjects.map(subObj => {
                            const subClone = fabric.util.object.clone(subObj);
                            subClone.set({
                                selectable: false,
                                hasControls: false,
                                hasBorders: false
                            });
                            return subClone;
                        });
                        
                        // Create new group with cloned objects
                        clone = new fabric.Group(clonedSubObjects, {
                            left: obj.left,
                            top: obj.top,
                            scaleX: obj.scaleX,
                            scaleY: obj.scaleY,
                            angle: obj.angle,
                            selectable: false,
                            hasControls: false,
                            hasBorders: false
                        });
                    } else {
                        // Normal object cloning
                        clone = fabric.util.object.clone(obj);
                        clone.set({
                            selectable: false,
                            hasControls: false,
                            hasBorders: false,
                            hoverCursor: 'default'
                        });
                    }
                    
                    tempCanvas.add(clone);
                });
                
                tempCanvas.renderAll();
                resolve();
            });
        });
    }

    handleZoom(delta) {
        // Get current zoom level
        let currentZoom = this.presentation.zoom || 100;
        
        // Calculate new zoom level
        let newZoom = currentZoom + delta;
        
        // Clamp zoom between 25% and 400%
        newZoom = Math.max(25, Math.min(400, newZoom));
        
        // Update zoom level
        this.presentation.zoom = newZoom;
        
        // Update zoom display
        document.querySelector('.zoom-level').textContent = `${newZoom}%`;
        
        // Apply new zoom
        this.fitToContainer();
    }

    updateAutoSaveStatus(status) {
        document.querySelector('.auto-save-status').textContent = status;
    }

    debounceAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            this.updateAutoSaveStatus('Saved');
        }, 1000);
    }

    debounceResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.initializeCanvas();
        }, 250);
    }

    updateRibbonContent(tab) {
        // TODO: Update ribbon content based on selected tab
        console.log(`Switched to ${tab} tab`);
    }

    addTextBox() {
        const text = new fabric.IText('Click to edit', {
            left: 100,
            top: 100,
            fontSize: 20,
            fill: '#000000',
            width: 300,
            textAlign: 'left',
            fontFamily: 'Arial',
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false
        });
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
    }

    updateSlideCount() {
        const total = this.presentation.slides.length;
        const current = this.presentation.slides.indexOf(this.presentation.currentSlide) + 1;
        document.querySelector('.slide-counter').textContent = `Slide ${current} of ${total}`;
    }

    selectSlide(slide) {
        if (!slide) return;
        
        const oldSlide = this.presentation.currentSlide;
        // Save the current slide before switching
        this.saveCurrentSlide();
        
        this.presentation.currentSlide = slide;
        this.canvas.clear(); // Clear canvas before loading new slide
        
        // Load the new slide's content
        this.loadSlide(slide);
        this.updateSlideList();
        this.updateSlideCount();
        
        // Scroll thumbnail into view
        const thumbnailEl = document.querySelector(`.slide-thumbnail-wrapper:nth-child(${this.presentation.slides.indexOf(slide) + 1})`);
        thumbnailEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    saveCurrentSlide() {
        if (!this.presentation.currentSlide) return;
        
        const currentIndex = this.presentation.slides.indexOf(this.presentation.currentSlide);
        if (currentIndex === -1) return;
        
        // Save all canvas objects with their complete state
        const savedObjects = this.canvas.getObjects().map(obj => obj.toObject());
        
        // Update the slide in the slides array
        this.presentation.slides[currentIndex] = {
            ...this.presentation.slides[currentIndex],
            objects: savedObjects
        };
        
        // Update thumbnail
        const thumbnailEl = document.querySelector(`.slide-thumbnail-wrapper:nth-child(${currentIndex + 1}) canvas`);
        if (thumbnailEl) {
            this.generateThumbnail(this.presentation.slides[currentIndex], thumbnailEl);
        }
    }

    deleteSlide(slide) {
        const index = this.presentation.slides.indexOf(slide);
        if (index === -1) return;

        this.presentation.slides.splice(index, 1);

        // If we deleted the current slide, select another one
        if (slide === this.presentation.currentSlide) {
            const nextSlide = this.presentation.slides[index] || 
                            this.presentation.slides[index - 1] ||
                            this.addNewSlide();
            this.selectSlide(nextSlide);
        } else {
            this.updateSlideList();
            this.updateSlideCount();
        }
    }

    moveSlide(fromIndex, toIndex) {
        const slide = this.presentation.slides[fromIndex];
        this.presentation.slides.splice(fromIndex, 1);
        this.presentation.slides.splice(toIndex, 0, slide);
        this.updateSlideList();
        this.updateSlideCount();
    }

    duplicateSlide(slide) {
        // Save current slide before duplicating
        this.saveCurrentSlide();
        
        const currentIndex = this.presentation.slides.indexOf(slide);
        // Create a deep copy of the slide with all object properties
        const newSlide = {
            id: Date.now(),
            objects: JSON.parse(JSON.stringify(slide.objects))
        };
        
        this.presentation.slides.splice(currentIndex + 1, 0, newSlide);
        this.presentation.currentSlide = newSlide;
        this.loadSlide(newSlide);
        this.updateSlideList();
    }

    setupParagraphControls() {
        // Text alignment
        const alignments = ['Left', 'Center', 'Right', 'Justify'];
        alignments.forEach(align => {
            document.getElementById(`align${align}Btn`)?.addEventListener('click', (e) => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    // Set text alignment
                    activeObject.set({
                        textAlign: align.toLowerCase(),
                        width: activeObject.width || 300 // Ensure width is set for alignment
                    });

                    // Remove active class from all alignment buttons
                    alignments.forEach(a => {
                        document.getElementById(`align${a}Btn`)?.classList.remove('active');
                    });

                    // Add active class to clicked button
                    e.currentTarget.classList.add('active');

                    this.canvas.renderAll();
                }
            });
        });

        // List controls
        document.getElementById('bulletListBtn')?.addEventListener('click', (e) => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                e.currentTarget.classList.toggle('active');
                document.getElementById('numberListBtn')?.classList.remove('active');
                this.toggleBulletList(activeObject);
            }
        });

        document.getElementById('numberListBtn')?.addEventListener('click', (e) => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                e.currentTarget.classList.toggle('active');
                document.getElementById('bulletListBtn')?.classList.remove('active');
                this.toggleNumberList(activeObject);
            }
        });

        // Indentation
        document.getElementById('indentDecreaseBtn')?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                const currentLeft = activeObject.left;
                activeObject.set('left', Math.max(0, currentLeft - 20));
                this.canvas.renderAll();
            }
        });

        document.getElementById('indentIncreaseBtn')?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                activeObject.set('left', activeObject.left + 20);
                this.canvas.renderAll();
            }
        });
    }

    toggleBulletList(textObject) {
        const lines = textObject.text.split('\n');
        const bulletChar = '  '; // Added extra space for better formatting
        const isBulletList = lines[0].startsWith(bulletChar);
        let newText;

        if (isBulletList) {
            // Remove bullets
            newText = lines.map(line => line.replace(bulletChar, '')).join('\n');
        } else {
            // Add bullets
            newText = lines.map(line => {
                // Remove numbers if exists
                line = line.replace(/^\d+\.\s/, '').trim();
                return `${bulletChar}${line}`;
            }).join('\n');
        }

        // Update text with proper width for alignment
        textObject.set({
            text: newText,
            width: textObject.width || 300
        });

        this.canvas.renderAll();
    }

    toggleNumberList(textObject) {
        const lines = textObject.text.split('\n');
        const isNumberList = /^\d+\.\s/.test(lines[0]);
        let newText;

        if (isNumberList) {
            // Remove numbers
            newText = lines.map(line => line.replace(/^\d+\.\s/, '')).join('\n');
        } else {
            // Add numbers
            newText = lines.map((line, index) => {
                // Remove bullet if exists
                line = line.replace(/^•\s+/, '').trim();
                return `${index + 1}. ${line}`;
            }).join('\n');
        }

        // Update text with proper width for alignment
        textObject.set({
            text: newText,
            width: textObject.width || 300
        });

        this.canvas.renderAll();
    }

    // Update object selection handler
    handleObjectSelection(e) {
        const selectedObject = e.target;
        if (selectedObject && selectedObject.type === 'i-text') {
            // Update font controls
            const fontFamilyBtn = document.querySelector('.selected-font');
            if (fontFamilyBtn) {
                fontFamilyBtn.textContent = selectedObject.fontFamily || 'Arial';
            }

            const fontSize = document.getElementById('fontSize');
            if (fontSize) {
                fontSize.value = selectedObject.fontSize || 20;
            }

            // Update style buttons
            document.getElementById('boldBtn')?.classList.toggle('active', selectedObject.fontWeight === 'bold');
            document.getElementById('italicBtn')?.classList.toggle('active', selectedObject.fontStyle === 'italic');
            document.getElementById('underlineBtn')?.classList.toggle('active', selectedObject.underline);

            // Update color picker
            const textColor = document.getElementById('textColor');
            if (textColor) {
                textColor.value = selectedObject.fill || '#000000';
            }

            // Update alignment buttons
            const alignments = ['Left', 'Center', 'Right', 'Justify'];
            alignments.forEach(align => {
                document.getElementById(`align${align}Btn`)?.classList.toggle(
                    'active', 
                    selectedObject.textAlign === align.toLowerCase()
                );
            });
        }

        // Show/hide delete button based on selection
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.style.display = selectedObject ? 'flex' : 'none';
        }
    }

    createShapeMenu() {
        // Remove any existing menus
        document.querySelectorAll('.shape-menu').forEach(menu => menu.remove());

        const menu = document.createElement('div');
        menu.className = 'shape-menu';
        
        const shapes = [
            // Basic Shapes
            { name: 'Rectangle', icon: 'ph-square', create: this.addRectangle.bind(this) },
            { name: 'Circle', icon: 'ph-circle', create: this.addCircle.bind(this) },
            { name: 'Triangle', icon: 'ph-triangle', create: this.addTriangle.bind(this) },
            { name: 'Oval', icon: 'ph-circle-half', create: this.addOval.bind(this) },
            { type: 'divider' },
            // Lines and Connectors
            { name: 'Line', icon: 'ph-line-segment', create: this.addLine.bind(this) },
            { name: 'Arrow', icon: 'ph-arrow-right', create: this.addArrow.bind(this) },
            { type: 'divider' },
            // Stars and Banners
            { name: 'Star', icon: 'ph-star', create: this.addStar.bind(this) },
            { name: 'Pentagon', icon: 'ph-pentagon', create: this.addPentagon.bind(this) }
        ];

        shapes.forEach(shape => {
            if (shape.type === 'divider') {
                const divider = document.createElement('div');
                divider.className = 'menu-divider';
                menu.appendChild(divider);
                return;
            }

            const item = document.createElement('div');
            item.className = 'shape-menu-item';
            item.innerHTML = `<i class="${shape.icon}"></i><span>${shape.name}</span>`;
            item.addEventListener('click', () => {
                shape.create();
                menu.remove();
            });
            menu.appendChild(item);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !e.target.closest('#shapeBtn')) {
                menu.remove();
            }
        }, { once: true });

        return menu;
    }

    addRectangle() {
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2
        });
        this.canvas.add(rect);
        this.canvas.setActiveObject(rect);
    }

    addCircle() {
        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 50,
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2
        });
        this.canvas.add(circle);
        this.canvas.setActiveObject(circle);
    }

    addTriangle() {
        const triangle = new fabric.Triangle({
            left: 100,
            top: 100,
            width: 100,
            height: 100,
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2
        });
        this.canvas.add(triangle);
        this.canvas.setActiveObject(triangle);
    }

    addLine() {
        const line = new fabric.Line([50, 50, 150, 150], {
            stroke: '#000000',
            strokeWidth: 2
        });
        this.canvas.add(line);
        this.canvas.setActiveObject(line);
    }

    addOval() {
        const oval = new fabric.Ellipse({
            left: 100,
            top: 100,
            rx: 75,
            ry: 50,
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2
        });
        this.canvas.add(oval);
        this.canvas.setActiveObject(oval);
    }

    addArrow() {
        const arrow = new fabric.Path('M 0 0 L 100 0 L 95 -5 M 100 0 L 95 5', {
            left: 100,
            top: 100,
            stroke: '#000000',
            strokeWidth: 2,
            fill: 'transparent'
        });
        this.canvas.add(arrow);
        this.canvas.setActiveObject(arrow);
    }

    addStar() {
        const points = 5;
        const outerRadius = 50;
        const innerRadius = 25;
        const path = this.calculateStarPoints(points, outerRadius, innerRadius);
        
        const star = new fabric.Path(path, {
            left: 100,
            top: 100,
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2
        });
        this.canvas.add(star);
        this.canvas.setActiveObject(star);
    }

    calculateStarPoints(points, outer, inner) {
        const angleDiff = (2 * Math.PI) / points;
        let path = 'M ';
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outer : inner;
            const angle = (i * angleDiff) / 2;
            const x = radius * Math.sin(angle);
            const y = radius * Math.cos(angle);
            path += `${x} ${y} ${i === 0 ? 'L' : ''} `;
        }
        
        return path + ' Z';
    }

    addPentagon() {
        const points = [];
        const sides = 5;
        const radius = 50;
        
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            points.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
            });
        }
        
        const pentagon = new fabric.Polygon(points, {
            left: 100,
            top: 100,
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2
        });
        this.canvas.add(pentagon);
        this.canvas.setActiveObject(pentagon);
    }

    createArrangeMenu() {
        // Check if menu already exists
        const existingMenu = document.querySelector('.arrange-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.className = 'arrange-menu';

        const arrangeOptions = [
            {
                name: 'Bring Forward',
                icon: 'ph-arrow-up',
                action: () => this.bringForward()
            },
            {
                name: 'Send Backward',
                icon: 'ph-arrow-down',
                action: () => this.sendBackward()
            },
            {
                name: 'Bring to Front',
                icon: 'ph-arrow-fat-up',
                action: () => this.bringToFront()
            },
            {
                name: 'Send to Back',
                icon: 'ph-arrow-fat-down',
                action: () => this.sendToBack()
            }
        ];

        arrangeOptions.forEach(option => {
            const item = document.createElement('div');
            item.className = 'arrange-item';
            item.innerHTML = `
                <i class="${option.icon}"></i>
                <span>${option.name}</span>
            `;
            item.addEventListener('click', () => {
                option.action();
                menu.remove();
            });
            menu.appendChild(item);
        });

        // Position and show menu
        const arrangeBtn = document.getElementById('arrangeBtn');
        if (arrangeBtn) {
            const rect = arrangeBtn.getBoundingClientRect();
            menu.style.top = `${rect.bottom + 5}px`;
            menu.style.left = `${rect.left}px`;
            document.body.appendChild(menu);

            // Handle clicks outside
            const handleClick = (e) => {
                if (!menu.contains(e.target) || e.target === arrangeBtn) {
                    menu.remove();
                    document.removeEventListener('click', handleClick);
                }
            };

            setTimeout(() => {
                document.addEventListener('click', handleClick);
            }, 0);
        }
    }

    bringForward() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.bringForward(activeObject);
            this.canvas.renderAll();
            this.saveCurrentSlide();
        }
    }

    sendBackward() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.sendBackwards(activeObject);
            this.canvas.renderAll();
            this.saveCurrentSlide();
        }
    }

    bringToFront() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.bringToFront(activeObject);
            this.canvas.renderAll();
            this.saveCurrentSlide();
        }
    }

    sendToBack() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.canvas.sendToBack(activeObject);
            this.canvas.renderAll();
            this.saveCurrentSlide();
        }
    }

    startShapeDrawing(shapeType) {
        this.currentTool = shapeType;
        this.canvas.defaultCursor = 'crosshair';
        this.canvas.selection = false;
        document.querySelector('.canvas-container').classList.add('drawing');
    }

    handleMouseDown(e) {
        if (!this.currentTool) return;

        this.isDrawing = true;
        const pointer = this.canvas.getPointer(e.e);
        this.startX = pointer.x;
        this.startY = pointer.y;

        switch (this.currentTool) {
            case 'rectangle':
                this.currentObject = new fabric.Rect({
                    left: this.startX,
                    top: this.startY,
                    width: 0,
                    height: 0,
                    fill: 'transparent',
                    stroke: '#000000',
                    strokeWidth: 2
                });
                break;
            case 'circle':
                this.currentObject = new fabric.Circle({
                    left: this.startX,
                    top: this.startY,
                    radius: 0,
                    fill: 'transparent',
                    stroke: '#000000',
                    strokeWidth: 2
                });
                break;
            case 'triangle':
                this.currentObject = new fabric.Triangle({
                    left: this.startX,
                    top: this.startY,
                    width: 0,
                    height: 0,
                    fill: 'transparent',
                    stroke: '#000000',
                    strokeWidth: 2
                });
                break;
            case 'line':
                this.currentObject = new fabric.Line([
                    this.startX,
                    this.startY,
                    this.startX,
                    this.startY
                ], {
                    stroke: '#000000',
                    strokeWidth: 2,
                    selectable: true
                });
                break;
            case 'oval':
                this.currentObject = new fabric.Ellipse({
                    left: this.startX,
                    top: this.startY,
                    rx: 0,
                    ry: 0,
                    fill: 'transparent',
                    stroke: '#000000',
                    strokeWidth: 2,
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'text':
                this.addTextBox(pointer);
                this.isDrawing = false;
                this.currentTool = null;
                return;
            case 'arrow':
            case 'doubleArrow':
                this.currentObject = new fabric.Line([
                    this.startX,
                    this.startY,
                    this.startX,
                    this.startY
                ], {
                    stroke: '#000000',
                    strokeWidth: 2,
                    selectable: true
                });
                this.currentObject.arrow = true;
                this.currentObject.doubleHeaded = this.currentTool === 'doubleArrow';
                break;
        }

        if (this.currentObject) {
            this.canvas.add(this.currentObject);
            this.canvas.renderAll();
        }
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;

        const pointer = this.canvas.getPointer(e.e);

        switch (this.currentTool) {
            case 'rectangle':
                this.currentObject.set({
                    width: Math.abs(pointer.x - this.startX),
                    height: Math.abs(pointer.y - this.startY),
                    left: pointer.x > this.startX ? this.startX : pointer.x,
                    top: pointer.y > this.startY ? this.startY : pointer.y
                });
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(pointer.x - this.startX, 2) + Math.pow(pointer.y - this.startY, 2)) / 2;
                this.currentObject.set({
                    radius: radius,
                    left: this.startX - radius,
                    top: this.startY - radius
                });
                break;
            case 'triangle':
                this.currentObject.set({
                    width: Math.abs(pointer.x - this.startX),
                    height: Math.abs(pointer.y - this.startY),
                    left: pointer.x > this.startX ? this.startX : pointer.x,
                    top: pointer.y > this.startY ? this.startY : pointer.y
                });
                break;
            case 'line':
                this.currentObject.set({
                    x2: pointer.x,
                    y2: pointer.y
                });
                break;
            case 'arrow':
            case 'doubleArrow':
                // Update line position
                this.currentObject.set({
                    x2: pointer.x,
                    y2: pointer.y
                });

                if (this.currentObject.arrow) {  // Only add arrow heads if it's an arrow
                    // Calculate angles and lengths
                    const angle = Math.atan2(pointer.y - this.startY, pointer.x - this.startX);
                    const headLength = 20;

                    // Remove old arrow heads
                    if (this.arrowHead) {
                        this.canvas.remove(this.arrowHead);
                    }
                    if (this.startArrowHead) {
                        this.canvas.remove(this.startArrowHead);
                    }

                    // Create end arrow head
                    const endPoints = [
                        { x: pointer.x - headLength * Math.cos(angle - Math.PI/6),
                          y: pointer.y - headLength * Math.sin(angle - Math.PI/6) },
                        { x: pointer.x, y: pointer.y },
                        { x: pointer.x - headLength * Math.cos(angle + Math.PI/6),
                          y: pointer.y - headLength * Math.sin(angle + Math.PI/6) }
                    ];

                    this.arrowHead = new fabric.Polygon(endPoints, {
                        fill: '#000000',
                        stroke: '#000000',
                        strokeWidth: 1,
                        selectable: false
                    });

                    this.canvas.add(this.arrowHead);

                    // Add start arrow head for double-headed arrows
                    if (this.currentObject.doubleHeaded) {
                        const startPoints = [
                            { x: this.startX + headLength * Math.cos(angle - Math.PI/6),
                              y: this.startY + headLength * Math.sin(angle - Math.PI/6) },
                            { x: this.startX, y: this.startY },
                            { x: this.startX + headLength * Math.cos(angle + Math.PI/6),
                              y: this.startY + headLength * Math.sin(angle + Math.PI/6) }
                        ];

                        this.startArrowHead = new fabric.Polygon(startPoints, {
                            fill: '#000000',
                            stroke: '#000000',
                            strokeWidth: 1,
                            selectable: false
                        });

                        this.canvas.add(this.startArrowHead);
                    }
                }
                break;
            case 'oval':
                const rx = Math.abs(pointer.x - this.startX) / 2;
                const ry = Math.abs(pointer.y - this.startY) / 2;
                const centerX = this.startX + (pointer.x - this.startX) / 2;
                const centerY = this.startY + (pointer.y - this.startY) / 2;
                
                this.currentObject.set({
                    rx: rx,
                    ry: ry,
                    left: centerX,
                    top: centerY
                });
                break;
        }

        this.canvas.renderAll();
    }

    handleMouseUp() {
        if ((this.currentTool === 'arrow' || this.currentTool === 'doubleArrow') && this.arrowHead) {
            const objects = [this.currentObject, this.arrowHead];
            if (this.startArrowHead) {
                objects.push(this.startArrowHead);
            }
            const group = new fabric.Group(objects, {
                selectable: true,
                hasControls: true
            });
            this.canvas.remove(...objects);
            this.canvas.add(group);
            this.arrowHead = null;
            this.startArrowHead = null;
        }

        this.isDrawing = false;
        this.currentObject = null;
        this.currentTool = null;
        this.canvas.defaultCursor = 'default';
        this.canvas.selection = true;
        document.querySelector('.canvas-container').classList.remove('drawing');
    }

    setupFormatControls() {
        // Fill controls
        document.querySelectorAll('.color-picker .color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                const activeObject = this.canvas.getActiveObject();
                if (!activeObject) return;

                // Determine if this is for fill or stroke based on parent elements
                const isStroke = e.currentTarget.closest('.stroke-controls') !== null;
                const property = isStroke ? 'stroke' : 'fill';
                
                // Update the object
                activeObject.set(property, color);
                this.canvas.renderAll();

                // Update the color input
                const inputId = isStroke ? 'shapeStroke' : 'shapeFill';
                const colorInput = document.getElementById(inputId);
                if (colorInput) {
                    colorInput.value = color;
                }
            });
        });

        // Color picker inputs
        const shapeFill = document.getElementById('shapeFill');
        if (shapeFill) {
            shapeFill.addEventListener('input', (e) => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    activeObject.set('fill', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        const shapeStroke = document.getElementById('shapeStroke');
        if (shapeStroke) {
            shapeStroke.addEventListener('input', (e) => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject) {
                    activeObject.set('stroke', e.target.value);
                    this.canvas.renderAll();
                }
            });
        }

        // No fill/stroke buttons
        document.getElementById('noFill')?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', 'transparent');
                this.canvas.renderAll();
            }
        });

        document.getElementById('noStroke')?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('stroke', 'transparent');
                this.canvas.renderAll();
            }
        });
    }

    handleSelectionCleared() {
        // Hide format panel when no object is selected
        const formatPanel = document.querySelector('.shape-format-panel');
        const formatShapeBtn = document.getElementById('formatShapeBtn');
        if (formatPanel) {
            formatPanel.style.display = 'none';
        }
        if (formatShapeBtn) {
            formatShapeBtn.classList.remove('active');
        }

        // Hide delete button when selection is cleared
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
    }

    handleObjectModified(e) {
        const modifiedObject = e.target;
        if (!modifiedObject) return;

        // Update transform controls
        document.getElementById('shapeWidth').value = Math.round(modifiedObject.width);
        document.getElementById('shapeHeight').value = Math.round(modifiedObject.height);
        document.getElementById('shapeRotation').value = Math.round(modifiedObject.angle || 0);
    }

    startTextDrawing() {
        this.currentTool = 'text';
        this.canvas.defaultCursor = 'text';
        this.canvas.selection = false;
        document.querySelector('.canvas-container').classList.add('drawing');
    }

    addTextBox(pointer) {
        const text = new fabric.IText('Click to edit text', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fontFamily: 'Arial',
            fill: '#000000',
            width: 300,
            padding: 5,
            originX: 'left',
            originY: 'top',
            textAlign: 'left'
        });

        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        text.enterEditing();
        this.canvas.renderAll();
    }

    setupTextFormatting() {
        const fontDropdownBtn = document.getElementById('fontFamilyBtn');
        const fontDropdown = document.getElementById('fontFamilyDropdown');
        const fontSearch = document.getElementById('fontSearch');
        const fontItems = document.querySelectorAll('.font-item');
        let selectedFont = 'Arial';
        let recentFonts = this.loadRecentFonts();
        this.updateRecentFontsUI(recentFonts);

        // Toggle dropdown
        fontDropdownBtn.addEventListener('click', () => {
            fontDropdown.classList.toggle('active');
        });

        // Load recent fonts on startup
        this.updateRecentFontsUI(recentFonts);

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.font-dropdown')) {
                fontDropdown.classList.remove('active');
            }
        });

        // Font search
        fontSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            fontItems.forEach(item => {
                const fontName = item.textContent.toLowerCase();
                item.style.display = fontName.includes(searchTerm) ? 'block' : 'none';
            });
            // Also search in recent fonts
            const recentFontsSection = document.getElementById('recentFonts');
            if (recentFontsSection) {
                const recentItems = recentFontsSection.querySelectorAll('.font-item');
                recentItems.forEach(item => {
                    const fontName = item.textContent.toLowerCase();
                    item.style.display = fontName.includes(searchTerm) ? 'block' : 'none';
                });
            }
        });

        // Font selection
        fontItems.forEach(item => {
            item.addEventListener('click', () => {
                const font = item.dataset.font;
                selectedFont = font;
                fontDropdownBtn.querySelector('.selected-font').textContent = font;
                fontDropdown.classList.remove('active');
                
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    activeObject.set('fontFamily', font);
                    this.canvas.requestRenderAll();
                    // Add to recent fonts
                    this.addToRecentFonts(font);
                }
            });
        });

        // Font size controls
        const fontSize = document.getElementById('fontSize');
        const increaseFontBtn = document.getElementById('increaseFontSize');
        const decreaseFontBtn = document.getElementById('decreaseFontSize');

        // Font size keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    if (e.key === '.') { // > key
                        e.preventDefault();
                        this.increaseFontSize(activeObject);
                    } else if (e.key === ',') { // < key
                        e.preventDefault();
                        this.decreaseFontSize(activeObject);
                    }
                }
            }
        });

        // Font size input
        if (fontSize) {
            fontSize.addEventListener('change', (e) => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    const size = parseInt(e.target.value);
                    if (!isNaN(size) && size > 0) {
                        activeObject.set('fontSize', size);
                        this.canvas.requestRenderAll();
                    }
                }
            });

            // Handle arrow keys when input is focused
            fontSize.addEventListener('keydown', (e) => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        this.increaseFontSize(activeObject);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        this.decreaseFontSize(activeObject);
                    }
                }
            });
        }

        // Increase font size button
        if (increaseFontBtn) {
            increaseFontBtn.addEventListener('click', () => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    this.increaseFontSize(activeObject);
                }
            });
        }

        // Decrease font size button
        if (decreaseFontBtn) {
            decreaseFontBtn.addEventListener('click', () => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    this.decreaseFontSize(activeObject);
                }
            });
        }

        // Paragraph alignment controls
        const alignLeftBtn = document.getElementById('alignLeftBtn');
        const alignCenterBtn = document.getElementById('alignCenterBtn');
        const alignRightBtn = document.getElementById('alignRightBtn');
        const alignJustifyBtn = document.getElementById('alignJustifyBtn');

        // Line spacing controls
        const lineSpacingBtn = document.getElementById('lineSpacingBtn');
        const lineSpacingDropdown = document.getElementById('lineSpacingDropdown');

        // Keyboard shortcuts for alignment
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    switch(e.key.toLowerCase()) {
                        case 'l':
                            e.preventDefault();
                            this.setTextAlignment(activeObject, 'left', alignLeftBtn);
                            break;
                        case 'e':
                            e.preventDefault();
                            this.setTextAlignment(activeObject, 'center', alignCenterBtn);
                            break;
                        case 'r':
                            e.preventDefault();
                            this.setTextAlignment(activeObject, 'right', alignRightBtn);
                            break;
                        case 'j':
                            e.preventDefault();
                            this.setTextAlignment(activeObject, 'justify', alignJustifyBtn);
                            break;
                    }
                }
            }
        });

        // Alignment button click handlers
        alignLeftBtn?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                this.setTextAlignment(activeObject, 'left', alignLeftBtn);
            }
        });

        alignCenterBtn?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                this.setTextAlignment(activeObject, 'center', alignCenterBtn);
            }
        });

        alignRightBtn?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                this.setTextAlignment(activeObject, 'right', alignRightBtn);
            }
        });

        alignJustifyBtn?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                this.setTextAlignment(activeObject, 'justify', alignJustifyBtn);
            }
        });

        // Line spacing controls
        lineSpacingBtn?.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            lineSpacingDropdown?.classList.toggle('active');
            
            // Position the dropdown below the button
            if (lineSpacingDropdown && lineSpacingBtn) {
                const btnRect = lineSpacingBtn.getBoundingClientRect();
                lineSpacingDropdown.style.top = `${btnRect.bottom + 2}px`;
                lineSpacingDropdown.style.left = `${btnRect.left}px`;
            }
        });

        // Close spacing dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#lineSpacingBtn') && !e.target.closest('#lineSpacingDropdown')) {
                lineSpacingDropdown?.classList.remove('active');
            }
        });

        // Line spacing item click handlers
        document.querySelectorAll('.spacing-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('custom')) {
                    // Create backdrop if it doesn't exist
                    let backdrop = document.querySelector('.dialog-backdrop');
                    if (!backdrop) {
                        backdrop = document.createElement('div');
                        backdrop.className = 'dialog-backdrop';
                        document.body.appendChild(backdrop);
                    }
                    backdrop.classList.add('active');
                    document.getElementById('customSpacingDialog')?.classList.add('active');
                    return;
                }

                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    const spacing = parseFloat(item.dataset.spacing);
                    if (!isNaN(spacing)) {
                        activeObject.set('lineHeight', spacing);
                        this.canvas.requestRenderAll();
                    }
                }
                lineSpacingDropdown?.classList.remove('active');
            });
        });

        // Custom spacing dialog handlers
        const customDialog = document.getElementById('customSpacingDialog');
        const closeBtn = customDialog?.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancelSpacing');
        const applyBtn = document.getElementById('applySpacing');
        const spacingTypeInputs = document.querySelectorAll('input[name="spacingType"]');
        const multipleInput = document.getElementById('multipleValue');
        const exactInput = document.getElementById('exactValue');

        // Handle spacing type change
        spacingTypeInputs.forEach(input => {
            input.addEventListener('change', () => {
                multipleInput.disabled = input.value === 'exact';
                exactInput.disabled = input.value === 'multiple';
            });
        });

        // Close dialog handlers
        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => {
                customDialog?.classList.remove('active');
                document.querySelector('.dialog-backdrop')?.classList.remove('active');
                lineSpacingDropdown?.classList.remove('active');
            });
        });

        // Apply custom spacing
        applyBtn?.addEventListener('click', () => {
            const activeObject = this.canvas.getActiveObject();
            if (activeObject && activeObject.type === 'i-text') {
                const spacingType = document.querySelector('input[name="spacingType"]:checked').value;
                let spacing;

                if (spacingType === 'multiple') {
                    spacing = parseFloat(multipleInput.value);
                } else {
                    // Convert points to line height multiplier (assuming 12pt is 1.0)
                    spacing = parseFloat(exactInput.value) / 12;
                }

                if (!isNaN(spacing) && spacing > 0) {
                    activeObject.set('lineHeight', spacing);
                    this.canvas.requestRenderAll();
                }
            }
            customDialog?.classList.remove('active');
            document.querySelector('.dialog-backdrop')?.classList.remove('active');
            lineSpacingDropdown?.classList.remove('active');
        });
    }

    setTextAlignment(textObject, alignment, activeBtn) {
        textObject.set('textAlign', alignment);
        this.canvas.requestRenderAll();

        // Update button states
        document.querySelectorAll('.align-btn').forEach(btn => btn.classList.remove('active'));
        activeBtn?.classList.add('active');
    }

    loadRecentFonts() {
        try {
            const recentFonts = localStorage.getItem('recentFonts');
            return recentFonts ? JSON.parse(recentFonts) : ['Arial'];
        } catch (e) {
            console.error('Error loading recent fonts:', e);
            return ['Arial'];
        }
    }

    saveRecentFonts(fonts) {
        try {
            localStorage.setItem('recentFonts', JSON.stringify(fonts));
        } catch (e) {
            console.error('Error saving recent fonts:', e);
        }
    }

    addToRecentFonts(font) {
        let recentFonts = this.loadRecentFonts();
        // Remove if already exists
        recentFonts = recentFonts.filter(f => f !== font);
        // Add to beginning
        recentFonts.unshift(font);
        // Keep only last 5 fonts
        recentFonts = recentFonts.slice(0, 5);
        // Save and update UI
        this.saveRecentFonts(recentFonts);
        this.updateRecentFontsUI(recentFonts);
    }

    updateRecentFontsUI(recentFonts) {
        const recentFontsSection = document.getElementById('recentFonts');
        if (!recentFontsSection) return;

        // Clear existing items except the category label
        const categoryLabel = recentFontsSection.querySelector('.category-label');
        recentFontsSection.innerHTML = '';
        recentFontsSection.appendChild(categoryLabel);

        // Add recent fonts
        recentFonts.forEach(font => {
            const fontItem = document.createElement('div');
            fontItem.className = 'font-item';
            fontItem.dataset.font = font;
            
            const fontName = document.createElement('div');
            fontName.className = 'font-name';
            fontName.textContent = font;
            
            const fontPreview = document.createElement('div');
            fontPreview.className = 'font-preview';
            fontPreview.style.fontFamily = font;
            fontPreview.textContent = 'The quick brown fox';
            
            fontItem.appendChild(fontName);
            fontItem.appendChild(fontPreview);
 
            // Add click handler
            fontItem.addEventListener('click', () => {
                const activeObject = this.canvas.getActiveObject();
                if (activeObject && activeObject.type === 'i-text') {
                    activeObject.set('fontFamily', font);
                    this.canvas.requestRenderAll();
                    // Update selected font display
                    document.getElementById('fontFamilyBtn').querySelector('.selected-font').textContent = font;
                    // Close dropdown
                    document.getElementById('fontFamilyDropdown').classList.remove('active');
                    // Add to recent fonts
                    this.addToRecentFonts(font);
                }
            });
 
            recentFontsSection.appendChild(fontItem);
        });
 
        // Hide section if no recent fonts
        recentFontsSection.style.display = recentFonts.length ? 'block' : 'none';
    }

    increaseFontSize(textObject) {
        const currentSize = textObject.fontSize || 20;
        let newSize;
        
        // Define size increments
        if (currentSize < 12) newSize = 12;
        else if (currentSize < 14) newSize = 14;
        else if (currentSize < 18) newSize = 18;
        else if (currentSize < 24) newSize = 24;
        else if (currentSize < 36) newSize = 36;
        else if (currentSize < 48) newSize = 48;
        else if (currentSize < 72) newSize = 72;
        else newSize = currentSize + 12;

        textObject.set('fontSize', newSize);
        const fontSize = document.getElementById('fontSize');
        if (fontSize) fontSize.value = newSize;
        this.canvas.requestRenderAll();
    }

    decreaseFontSize(textObject) {
        const currentSize = textObject.fontSize || 20;
        let newSize;
        
        // Define size decrements
        if (currentSize > 72) newSize = 72;
        else if (currentSize > 48) newSize = 48;
        else if (currentSize > 36) newSize = 36;
        else if (currentSize > 24) newSize = 24;
        else if (currentSize > 18) newSize = 18;
        else if (currentSize > 14) newSize = 14;
        else if (currentSize > 12) newSize = 12;
        else newSize = Math.max(8, currentSize - 2);

        textObject.set('fontSize', newSize);
        const fontSize = document.getElementById('fontSize');
        if (fontSize) fontSize.value = newSize;
        this.canvas.requestRenderAll();
    }

    setupSlideControls() {
        // Initialize Sortable
        const slideThumbnails = document.getElementById('slideThumbnails');
        if (slideThumbnails) {
            new Sortable(slideThumbnails, {
                animation: 150,
                handle: '.slide-thumbnail',
                ghostClass: 'slide-ghost',
                // Disable drag by default
                disabled: true,
                onStart: () => {
                    this.isDragging = true;
                },
                onEnd: (evt) => {
                    setTimeout(() => {
                        this.isDragging = false;
                    }, 0);
                    const { oldIndex, newIndex } = evt;
                    // Update slides array
                    const slide = this.presentation.slides.splice(oldIndex, 1)[0];
                    this.presentation.slides.splice(newIndex, 0, slide);
                    // Update slide numbers
                    this.updateSlideNumbers();
                    // Save current state
                    this.saveCurrentSlide();
                }
            });

            // Enable drag on double click
            let lastClickTime = 0;
            slideThumbnails.addEventListener('click', (e) => {
                const currentTime = new Date().getTime();
                const clickTimeDiff = currentTime - lastClickTime;
                
                if (clickTimeDiff < 300) { // Double click detected
                    // Toggle drag mode
                    const sortableInstance = Sortable.get(slideThumbnails);
                    sortableInstance.option("disabled", !sortableInstance.option("disabled"));
                    
                    // Update cursor style
                    slideThumbnails.classList.toggle('drag-mode');
                }
                
                lastClickTime = currentTime;
            });
        }

        // New slide button
        const newSlideBtn = document.querySelector('.slide-action-btn[title*="New Slide"]');
        newSlideBtn?.addEventListener('click', () => this.addNewSlide());

        // Duplicate slide button
        const duplicateSlideBtn = document.querySelector('.slide-action-btn[title*="Duplicate Slide"]');
        duplicateSlideBtn?.addEventListener('click', () => {
            if (this.presentation.currentSlide) {
                this.duplicateSlide(this.presentation.currentSlide);
            }
        });

        // Delete slide button
        const deleteSlideBtn = document.querySelector('.slide-action-btn[title*="Delete Slide"]');
        deleteSlideBtn?.addEventListener('click', () => {
            if (this.presentation.currentSlide && this.presentation.slides.length > 1) {
                this.deleteSlide(this.presentation.currentSlide);
            }
        });
    }

    updateSlideNumbers() {
        const slideNumbers = document.querySelectorAll('.slide-number');
        slideNumbers.forEach((number, index) => {
            number.textContent = index + 1;
        });
        this.updateSlideCount();
    }

    loadSlide(slide) {
        this.canvas.clear();
        
        if (!slide.objects) return;
        
        // Create a fresh canvas for the new slide
        this.canvas.setBackgroundColor('white', this.canvas.renderAll.bind(this.canvas));
        
        // Load all objects using fabric's built-in methods
        fabric.util.enlivenObjects(slide.objects, (objects) => {
            objects.forEach(obj => {
                this.canvas.add(obj);
            });
            this.canvas.renderAll();
        });
    }

    navigateSlides(direction) {
        if (!this.presentation.currentSlide) return;
        
        const currentIndex = this.presentation.slides.indexOf(this.presentation.currentSlide);
        let newIndex;
        
        if (direction === 'prev') {
            newIndex = Math.max(0, currentIndex - 1);
        } else {
            newIndex = Math.min(this.presentation.slides.length - 1, currentIndex + 1);
        }
        
        if (newIndex !== currentIndex) {
            this.selectSlide(this.presentation.slides[newIndex]);
        }
    }

    setupTransitions() {
        this.transitions = {
            none: (oldSlide, newSlide) => {
                return Promise.resolve();
            },
            fade: (oldSlide, newSlide) => {
                return new Promise(resolve => {
                    this.canvas.clear();
                    this.loadSlide(newSlide);
                    this.canvas.getObjects().forEach(obj => {
                        obj.set('opacity', 0);
                    });
                    this.canvas.renderAll();
 
                    const fadeIn = () => {
                        let allVisible = true;
                        this.canvas.getObjects().forEach(obj => {
                            if (obj.opacity < 1) {
                                obj.set('opacity', Math.min(1, obj.opacity + 0.1));
                                allVisible = false;
                            }
                        });
                        this.canvas.renderAll();
 
                        if (!allVisible) {
                            requestAnimationFrame(fadeIn);
                        } else {
                            resolve();
                        }
                    };
 
                    fadeIn();
                });
            },
            slide: (oldSlide, newSlide, direction = 'right') => {
                return new Promise(resolve => {
                    const width = this.canvas.width;
                    const startX = direction === 'right' ? width : -width;
                    
                    this.canvas.clear();
                    this.loadSlide(newSlide);
                    this.canvas.getObjects().forEach(obj => {
                        obj.set('left', obj.left + startX);
                    });
 
                    const animate = () => {
                        let stillMoving = false;
                        const step = direction === 'right' ? -40 : 40;
 
                        this.canvas.getObjects().forEach(obj => {
                            const targetLeft = obj.left - startX;
                            const currentLeft = obj.left;
                            const newLeft = currentLeft + step;
 
                            if (Math.abs(targetLeft - currentLeft) > Math.abs(step)) {
                                obj.set('left', newLeft);
                                stillMoving = true;
                            } else {
                                obj.set('left', targetLeft);
                            }
                        });
 
                        this.canvas.renderAll();
 
                        if (stillMoving) {
                            requestAnimationFrame(animate);
                        } else {
                            resolve();
                        }
                    };
 
                    animate();
                });
            }
        };
    }

    delayedThumbnailUpdate() {
        if (!this._thumbnailUpdateTimeout) {
            this._thumbnailUpdateTimeout = setTimeout(() => {
                this.updateCurrentThumbnail();
                this._thumbnailUpdateTimeout = null;
            }, 100);
        }
    }

    updateCurrentThumbnail() {
        if (!this.presentation.currentSlide) return;
        
        const currentIndex = this.presentation.slides.indexOf(this.presentation.currentSlide);
        if (currentIndex === -1) return;

        // Get current canvas state with complete object properties
        const savedObjects = this.canvas.getObjects().map(obj => {
            const objState = obj.toObject(['selectable', 'hasControls', 'hasBorders']);
            
            // Handle grouped objects (like arrows)
            if (obj.type === 'group') {
                objState.objects = obj.getObjects().map(o => o.toObject(['selectable', 'hasControls', 'hasBorders']));
            }
            
            // Handle text objects
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                objState.styles = obj.styles;
            }
            
            return objState;
        });
        
        // Update the slide objects
        this.presentation.slides[currentIndex].objects = savedObjects;

        // Update thumbnail
        const thumbnailEl = document.querySelector(`.slide-thumbnail-wrapper:nth-child(${currentIndex + 1}) canvas`);
        if (thumbnailEl) {
            this.generateThumbnail(this.presentation.slides[currentIndex], thumbnailEl);
        }
    }

    showLayoutMenu() {
        // Check if menu already exists
        const existingMenu = document.querySelector('.layout-menu');
        if (existingMenu) {
            existingMenu.remove();
            return; // Exit if we're just closing an open menu
        }

        const menu = document.createElement('div');
        menu.className = 'layout-menu';

        // Add layout options
        Object.entries(this.layouts).forEach(([key, layout]) => {
            const item = document.createElement('div');
            item.className = 'layout-item';
            
            const preview = document.createElement('div');
            preview.className = 'layout-preview';
            preview.dataset.layout = key;

            const label = document.createElement('div');
            label.className = 'layout-label';
            label.textContent = layout.name;

            item.appendChild(preview);
            item.appendChild(label);

            item.addEventListener('click', () => {
                this.applyLayout(key);
                menu.remove();
            });

            menu.appendChild(item);
        });

        // Position and show menu
        const layoutBtn = document.getElementById('layoutBtn');
        if (layoutBtn) {
            const rect = layoutBtn.getBoundingClientRect();
            menu.style.top = `${rect.bottom + 5}px`;
            menu.style.left = `${rect.left}px`;
            document.body.appendChild(menu);

            // Handle clicks outside the menu and on the layout button
            const handleClick = (e) => {
                if (!menu.contains(e.target) || e.target === layoutBtn) {
                    menu.remove();
                    document.removeEventListener('click', handleClick);
                }
            };

            // Delay adding the click listener to prevent immediate closure
            setTimeout(() => {
                document.addEventListener('click', handleClick);
            }, 0);
        }
    }

    applyLayout(layoutKey) {
        const layout = this.layouts[layoutKey];
        if (!layout) return;

        // Clear current slide
        this.canvas.clear();
        
        // Create layout objects
        const objects = layout.create();
        
        // Add objects to canvas
        objects.forEach(obj => {
            this.canvas.add(obj);
        });

        this.canvas.renderAll();
        this.saveCurrentSlide();
    }

    toggleOutlineView(show) {
        const slideThumbnails = document.getElementById('slideThumbnails');
        const outlineView = document.getElementById('outlineView');
        
        if (show) {
            slideThumbnails.style.display = 'none';
            if (!outlineView) {
                this.createOutlineView();
            } else {
                outlineView.style.display = 'block';
                this.updateOutlineView();
            }
        } else {
            slideThumbnails.style.display = 'block';
            if (outlineView) {
                outlineView.style.display = 'none';
            }
        }
    }

    createOutlineView() {
        const container = document.createElement('div');
        container.id = 'outlineView';
        container.className = 'outline-view';
        
        // Insert before thumbnails
        const slideThumbnails = document.getElementById('slideThumbnails');
        slideThumbnails.parentNode.insertBefore(container, slideThumbnails);
        
        this.updateOutlineView();
    }

    updateOutlineView() {
        const outlineView = document.getElementById('outlineView');
        if (!outlineView) return;
        
        outlineView.innerHTML = '';
        
        this.presentation.slides.forEach((slide, index) => {
            const slideOutline = document.createElement('div');
            slideOutline.className = 'outline-slide';
            
            // Add slide number
            const slideNumber = document.createElement('div');
            slideNumber.className = 'outline-slide-number';
            slideNumber.textContent = index + 1;
            slideOutline.appendChild(slideNumber);
            
            // Extract and display text content
            const textContent = this.getSlideTextContent(slide);
            const contentDiv = document.createElement('div');
            contentDiv.className = 'outline-content';
            
            textContent.forEach(text => {
                const p = document.createElement('p');
                p.className = text.isTitle ? 'outline-title' : 'outline-body';
                p.textContent = text.content;
                contentDiv.appendChild(p);
            });
            
            slideOutline.appendChild(contentDiv);
            
            // Add click handler to select slide
            slideOutline.addEventListener('click', () => {
                this.selectSlide(slide);
                
                // Update active state
                document.querySelectorAll('.outline-slide').forEach(s => s.classList.remove('active'));
                slideOutline.classList.add('active');
            });
            
            // Add active state for current slide
            if (slide === this.presentation.currentSlide) {
                slideOutline.classList.add('active');
            }
            
            outlineView.appendChild(slideOutline);
        });
    }

    getSlideTextContent(slide) {
        const textContent = [];
        
        if (!slide.objects) return textContent;
        
        slide.objects.forEach(obj => {
            if (obj.type === 'i-text' || obj.type === 'textbox') {
                // Determine if it's a title (based on font size or position)
                const isTitle = obj.fontSize >= 36 || obj.top < 120;
                textContent.push({
                    content: obj.text,
                    isTitle: isTitle
                });
            }
        });
        
        return textContent;
    }

    createReadingView() {
        const container = document.createElement('div');
        container.id = 'readingView';
        container.className = 'reading-view';

        // Add navigation controls with slide counter
        const controls = document.createElement('div');
        controls.className = 'reading-controls';
        controls.innerHTML = `
            <div class="reading-nav-left">
                <button class="reading-nav-btn prev-slide" title="Previous Slide">
                    <i class="ph ph-caret-left"></i>
                </button>
                <span class="reading-slide-counter">1 / 1</span>
                <button class="reading-nav-btn next-slide" title="Next Slide">
                    <i class="ph ph-caret-right"></i>
                </button>
            </div>
            <div class="reading-nav-right">
                <button class="reading-nav-btn toggle-fullscreen" title="Toggle Fullscreen">
                    <i class="ph ph-arrows-out"></i>
                </button>
                <button class="reading-nav-btn exit-reading" title="Exit Reading View">
                    <i class="ph ph-x"></i>
                </button>
            </div>
        `;

        // Add canvas container
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'reading-canvas-container';
        const canvas = document.createElement('canvas');
        canvas.id = 'readingCanvas';
        canvasContainer.appendChild(canvas);

        container.appendChild(controls);
        container.appendChild(canvasContainer);
        document.querySelector('.main-content').appendChild(container);

        // Add event listeners
        container.querySelector('.prev-slide').addEventListener('click', () => {
            this.navigateReadingView('prev');
        });
        
        container.querySelector('.next-slide').addEventListener('click', () => {
            this.navigateReadingView('next');
        });
        
        container.querySelector('.exit-reading').addEventListener('click', () => {
            this.exitReadingView();
        });

        container.querySelector('.toggle-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen(container);
        });

        // Add keyboard navigation
        document.addEventListener('keydown', this.handleReadingViewKeyboard.bind(this));

        // Initialize reading canvas
        this.readingCanvas = new fabric.Canvas('readingCanvas', {
            width: 1280,
            height: 720,
            selection: false,
            backgroundColor: 'white'
        });

        // Update slide counter
        this.updateReadingViewCounter();

        return container;
    }

    navigateReadingView(direction) {
        const currentIndex = this.presentation.slides.indexOf(this.presentation.currentSlide);
        let newIndex;

        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : this.presentation.slides.length - 1;
        } else {
            newIndex = currentIndex < this.presentation.slides.length - 1 ? currentIndex + 1 : 0;
        }

        this.selectSlide(this.presentation.slides[newIndex]);
        this.updateReadingView();
        this.updateReadingViewCounter();
    }

    updateReadingViewCounter() {
        const counter = document.querySelector('.reading-slide-counter');
        if (counter) {
            const currentIndex = this.presentation.slides.indexOf(this.presentation.currentSlide) + 1;
            const total = this.presentation.slides.length;
            counter.textContent = `${currentIndex} / ${total}`;
        }
    }

    handleReadingViewKeyboard(e) {
        if (document.getElementById('readingView').style.display !== 'flex') return;

        switch(e.key) {
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.navigateReadingView('prev');
                break;
            case 'ArrowRight':
            case 'PageDown':
            case ' ':  // Spacebar
                e.preventDefault();
                this.navigateReadingView('next');
                break;
            case 'Escape':
                e.preventDefault();
                this.exitReadingView();
                break;
            case 'f':
            case 'F':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleFullscreen(document.getElementById('readingView'));
                }
                break;
        }
    }

    toggleFullscreen(element) {
        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    exitReadingView() {
        // Save current slide state from reading view
        if (this.readingCanvas) {
            const currentObjects = this.readingCanvas.getObjects().map(obj => {
                const clone = fabric.util.object.clone(obj);
                return clone.toObject(['selectable', 'hasControls', 'hasBorders']);
            });
            
            if (this.presentation.currentSlide) {
                this.presentation.currentSlide.objects = currentObjects;
            }
        }
        
        // Remove keyboard listener
        document.removeEventListener('keydown', this.handleReadingViewKeyboard);
        
        // Switch back to normal view
        this.switchViewMode('Normal');
        
        // Ensure the reading canvas is properly cleaned up
        if (this.readingCanvas) {
            this.readingCanvas.dispose();
            this.readingCanvas = null;
        }
        
        // Load the saved slide content back into the main canvas
        if (this.presentation.currentSlide) {
            this.loadSlide(this.presentation.currentSlide);
            this.canvas.renderAll();
        }
        
        // Update thumbnails
        this.updateSlideList();
    }

    updateReadingView() {
        if (!this.readingCanvas) return;
        
        // Save current slide before updating reading view
        this.saveCurrentSlide();
        
        // Clear reading canvas
        this.readingCanvas.clear();
        
        // Load current slide content
        if (this.presentation.currentSlide && this.presentation.currentSlide.objects) {
            fabric.util.enlivenObjects(this.presentation.currentSlide.objects, (objects) => {
                objects.forEach(obj => {
                    const clone = fabric.util.object.clone(obj);
                    clone.set({
                        selectable: false,
                        hasControls: false,
                        hasBorders: false,
                        hoverCursor: 'default'
                    });
                    this.readingCanvas.add(clone);
                });
                this.readingCanvas.renderAll();
                this.fitReadingCanvas();
            });
        }
    }

    fitReadingCanvas() {
        const container = document.querySelector('.reading-canvas-container');
        if (!container) return;
        
        // Get container dimensions
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Add margin around slide
        const margin = 60;
        const availableWidth = containerWidth - (margin * 2);
        const availableHeight = containerHeight - (margin * 2);
        
        // Calculate scale to fit slide within available space
        const scaleX = availableWidth / 1280;
        const scaleY = availableHeight / 720;
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate centered position
        const scaledWidth = 1280 * scale;
        const scaledHeight = 720 * scale;
        const left = (containerWidth - scaledWidth) / 2;
        const top = (containerHeight - scaledHeight) / 2;
        
        // Update canvas size and position
        this.readingCanvas.setDimensions({
            width: scaledWidth,
            height: scaledHeight
        });
        
        // Position canvas in center
        const canvasElement = document.getElementById('readingCanvas');
        if (canvasElement) {
            canvasElement.style.position = 'absolute';
            canvasElement.style.left = `${left}px`;
            canvasElement.style.top = `${top}px`;
        }
        
        // Set zoom and render
        this.readingCanvas.setZoom(scale);
        this.readingCanvas.renderAll();
    }

    deleteSelectedObject() {
        const activeObject = this.canvas.getActiveObject();
        if (!activeObject) return;

        // If it's a group selection, remove all objects in the group
        if (activeObject.type === 'activeSelection') {
            const objects = activeObject.getObjects();
            objects.forEach(obj => this.canvas.remove(obj));
        } else {
            this.canvas.remove(activeObject);
        }

        this.canvas.discardActiveObject();
        this.canvas.renderAll();
        this.saveCurrentSlide();
    }

    saveState() {
        // Get current state
        const state = JSON.stringify(this.canvas.toJSON(['selectable', 'hasControls', 'hasBorders']));
        
        // Don't save if it's the same as the last state
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === state) {
            return;
        }
        
        // Add state to undo stack
        this.undoStack.push(state);
        
        // Clear redo stack when new action is performed
        if (this.redoStack.length > 0) {
            this.redoStack = [];
        }
        
        // Update button states
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length > 1) { // Keep at least one state
            // Get current state and add to redo stack
            const currentState = this.undoStack.pop();
            this.redoStack.push(currentState);
            
            // Load the previous state (now the last item in undoStack)
            const prevState = this.undoStack[this.undoStack.length - 1];
            this.loadCanvasState(prevState);
            
            // Update buttons
            this.updateUndoRedoButtons();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            // Get the state to redo
            const nextState = this.redoStack.pop();
            
            // Save current state to undo stack
            const currentState = JSON.stringify(this.canvas.toJSON(['selectable', 'hasControls', 'hasBorders']));
            this.undoStack.push(currentState);
            
            // Load the redo state
            this.loadCanvasState(nextState);
            
            // Update buttons
            this.updateUndoRedoButtons();
        }
    }

    loadCanvasState(state) {
        if (!state) return;
        
        this.canvas.clear();
        this.canvas.loadFromJSON(JSON.parse(state), () => {
            this.canvas.renderAll();
            this.saveCurrentSlide();
            this.updateUndoRedoButtons();
        });
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length === 0;
            undoBtn.style.opacity = this.undoStack.length === 0 ? '0.5' : '1';
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.redoStack.length === 0;
            redoBtn.style.opacity = this.redoStack.length === 0 ? '0.5' : '1';
        }
    }
}

// Initialize the editor when the page loads
window.addEventListener('load', () => {
    window.editor = new PresentationEditor();
}); 