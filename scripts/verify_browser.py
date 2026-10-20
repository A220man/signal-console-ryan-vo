"""Exercise the actual Compose frontend and persistent PostgreSQL bank workflow."""
import json, subprocess, time, urllib.request, uuid
from playwright.sync_api import sync_playwright, expect

def ready(url):
    deadline = time.monotonic() + 120
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=3) as response:
                if response.status == 200: return
        except OSError: pass
        time.sleep(1)
    raise RuntimeError('Readiness failed: ' + url)

ready('http://127.0.0.1:8000/health')
ready('http://127.0.0.1:5173/')
name = 'browser-' + uuid.uuid4().hex[:12]
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://127.0.0.1:5173/banks')
    page.get_by_role('link', name='Create Bank', exact=True).click()
    page.locator('#name').fill(name)
    page.locator('#description').fill('Initial browser record')
    with page.expect_response(lambda r: r.request.method == 'POST' and r.url.endswith('/api/v1/banks')) as created:
        page.get_by_role('button', name='Create Bank', exact=True).click()
    assert created.value.status == 201, created.value.text()
    identifier = created.value.json()['id']
    row = page.get_by_role('row').filter(has_text=name)
    expect(row).to_have_count(1)
    row.get_by_role('link', name='Edit', exact=True).click()
    page.locator('#description').fill('Updated browser record')
    with page.expect_response(lambda r: r.request.method == 'PATCH' and r.url.endswith('/api/v1/banks/' + str(identifier))) as updated:
        page.get_by_role('button', name='Update Bank', exact=True).click()
    assert updated.value.status == 200, updated.value.text()
    expect(page.get_by_role('row').filter(has_text=name)).to_contain_text('Updated browser record')
    page.reload()
    expect(page.get_by_role('row').filter(has_text=name)).to_contain_text('Updated browser record')
    subprocess.run(['docker','compose','restart','backend'], check=True)
    ready('http://127.0.0.1:8000/health')
    page.reload()
    expect(page.get_by_role('row').filter(has_text=name)).to_contain_text('Updated browser record')
    with urllib.request.urlopen('http://127.0.0.1:8000/api/v1/banks/' + str(identifier)) as response:
        persisted = json.load(response)
    assert persisted['name'] == name and persisted['description'] == 'Updated browser record'
    page.once('dialog', lambda dialog: dialog.accept())
    with page.expect_response(lambda r: r.request.method == 'DELETE' and r.url.endswith('/api/v1/banks/' + str(identifier))) as deleted:
        page.get_by_role('row').filter(has_text=name).get_by_role('button', name='Delete', exact=True).click()
    assert deleted.value.status == 204, deleted.value.text()
    expect(page.get_by_role('row').filter(has_text=name)).to_have_count(0)
    print(json.dumps({'browser_create':True,'browser_edit':True,'reload':True,'backend_restart_persistence':True,'browser_delete':True,'bank_id':identifier}))
    browser.close()
