#!/usr/bin/env python3
"""
Debug utility to list all registered routes in the FastAPI application
"""

import sys
sys.path.insert(0, '/app/backend')

from server import app

def list_routes():
    """List all registered routes in the FastAPI app"""
    print("\n" + "="*80)
    print("REGISTERED API ROUTES".center(80))
    print("="*80 + "\n")
    
    routes = []
    for route in app.routes:
        if hasattr(route, 'methods'):
            methods = ', '.join(route.methods)
            path = route.path
            name = route.name if hasattr(route, 'name') else 'Unknown'
            routes.append((path, methods, name))
    
    # Sort by path
    routes.sort(key=lambda x: x[0])
    
    # Group by prefix
    current_prefix = None
    for path, methods, name in routes:
        prefix = path.split('/')[1] if '/' in path[1:] else path
        if prefix != current_prefix:
            current_prefix = prefix
            print(f"\n[{prefix.upper()}]")
        
        print(f"  {methods:20} {path:50} ({name})")
    
    print(f"\n\nTotal Routes: {len(routes)}")
    print("="*80 + "\n")

if __name__ == '__main__':
    list_routes()
