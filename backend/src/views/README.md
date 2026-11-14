# Backend Views & API Templates

This directory houses server-side response templates, email templates, and view documentation for the WeCare REST API.

## Architecture Note
The WeCare API operates as a headless RESTful microservice. The client presentation layer is hosted in the `frontend/` application directory.
When server-side HTML rendering or templated email notifications (such as appointment confirmation emails or PDF diagnostic summary generation) are dispatched, their layout templates reside in this folder.
