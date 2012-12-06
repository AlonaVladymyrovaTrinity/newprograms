/*
 * mylibrary.h
 *
 *  Created on: 06.12.2012
 *      Author: x0194611
 */

int heap_init(unsigned int heap_size);
void heap_close(void);
void *_myalloc(size_t size);
void *myalloc(size_t size);
void _myfree(void *ptr);
void myfree(void *ptr);
void print_mem(void);
