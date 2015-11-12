Catalogue Examples
==================

circular
--------

Two catalogues which reference each other.
A useful test to see if a crawler terminates or runs forever.

eyehub
------

local.json, resource metadata using non-namespaced semantics
external.json, resource metadata pointing at externally defined semantics
reference.json, resource embedded in catalogue and then referenced

home
----

Hierarchical catalogue representing rooms in a home

tree
----

Hierarchical catalogue showing a tree structure

sensors
-------

Example of using catalogue format to represent sensors, without pointing at any
external resource.

layered
-------

Example of multiple catalogues giving different information about the same
resource. As the client explores/crawls the linked catalogues they discover
more detail.

foaf
----

Using external FOAF ontology to make some statements

